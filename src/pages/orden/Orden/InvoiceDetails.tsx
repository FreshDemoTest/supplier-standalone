import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { enqueueSnackbar } from "notistack";
// material
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import { CheckCircle, Cancel, MoreVert } from "@mui/icons-material";
// redux
import {
  cancelInvoice,
  clearActiveInvoicesOrden,
  clearInvoiceDetailsSuccess,
  getInvoiceDetails,
  getInvoiceExecStatus,
  getInvoicesByOrden,
  triggerGenerateInvoice,
} from "../../../redux/slices/orden";
import { getUnit } from "../../../redux/slices/account";
// hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// domain
import {
  ExecutionStatusTypes,
  InvoiceStatusTypes,
  InvoiceType,
  paymentMethodType,
  paymentMethods,
} from "../../../domain/orden/Orden";
// utils
import {
  createBlobURI,
  displayInvoiceExecutionError,
  fCurrency,
  fDateTime,
  fISODate,
  fileToString,
} from "../../../utils/helpers";
import track from "../../../utils/analytics";
// components
import BasicDialog from "../../../components/navigation/BasicDialog";
import { DynamicLoader } from "../../../components/DynamicLoader";
import InvoiceCardItem from "../../../components/invoice/InvoiceCardItem";
import LoadingProgress from "../../../components/LoadingProgress";
import MenuPopover from "../../../components/MenuPopover";
// routes
import { PATH_APP } from "../../../routes/paths";

// ----------------------------------------------------------------------

const formatTicketInvoiceDetails = (invoiceXml: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(invoiceXml, "text/xml");

  const cfdiComp = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
  const cfdiEmisor = cfdiComp.getElementsByTagName("cfdi:Emisor")[0];
  const cfdiReceptor = cfdiComp.getElementsByTagName("cfdi:Receptor")[0];
  const cfdiConceptos = cfdiComp.getElementsByTagName("cfdi:Conceptos")[0];
  const cfdiImpuestos = cfdiComp.getElementsByTagName("cfdi:Impuestos")[0];
  const cfdiComplementoTimbre = xmlDoc.getElementsByTagName(
    "tfd:TimbreFiscalDigital"
  )[0];

  const formatProds = (prods: Element): string => {
    // let _prodsStr = `PRODUCTO | CANT | UNID |   CONCEPTO   | PRECIO UNI | IMPORTE\n`;
    let _prodsStr = "";
    // add products per concept
    const _prods = prods.getElementsByTagName("cfdi:Concepto");
    for (let i = 0; i < _prods.length; i++) {
      const _pd = _prods[i];
      // product string
      _prodsStr += `${_pd.getAttribute("ClaveProdServ") || ""} | ${
        _pd.getAttribute("Cantidad") || ""
      } | ${_pd.getAttribute("ClaveUnidad") || ""} | ${
        _pd.getAttribute("Descripcion")?.slice(0, 20) || ""
      } (${_pd.getAttribute("ObjetoImp") || ""}) | ${
        _pd.getAttribute("ValorUnitario") || ""
      } | ${fCurrency(_pd.getAttribute("Importe") || "")}\n`;
      // impuestos trasladados
      const _impP = _pd.getElementsByTagName("cfdi:Traslado");
      if (_impP.length > 0) {
        for (let j = 0; j < _impP.length; j++) {
          const _imp = _impP[j];
          const impType =
            _imp.getAttribute("Impuesto") === "002" ? "IVA" : "IEPS";
          _prodsStr += `     ${impType}: ${_imp.getAttribute(
            "Impuesto"
          )} Base: ${_imp.getAttribute("Base") || ""}, Tasa: ${
            _imp.getAttribute("TasaOCuota") || ""
          }, Importe: ${_imp.getAttribute("Importe") || ""}\n`;
        }
      }
    }
    return _prodsStr;
  };

  return `FACTURA FOLIO: ${cfdiComp.getAttribute("Folio")}

EMISOR
${cfdiEmisor.getAttribute("Nombre")}
${cfdiEmisor.getAttribute("Rfc")}
Lugar de Expedicion: ${cfdiComp.getAttribute("LugarExpedicion")}
Regimen Fiscal: ${cfdiEmisor.getAttribute("RegimenFiscal")}
Efecto de Comprobante: ${cfdiComp.getAttribute("TipoDeComprobante")}

RECEPTOR
${cfdiReceptor.getAttribute("Nombre")}
${cfdiReceptor.getAttribute("Rfc")}
Codigo Postal: ${cfdiReceptor.getAttribute("DomicilioFiscalReceptor")}
Uso de CFDI: ${cfdiReceptor.getAttribute("UsoCFDI")}
Regimen Fiscal: ${cfdiReceptor.getAttribute("RegimenFiscalReceptor")}

Folio Fiscal: ${cfdiComplementoTimbre.getAttribute("UUID")}
Fecha/Hora Emision: ${cfdiComplementoTimbre
    .getAttribute("FechaTimbrado")
    ?.replaceAll("T", " ")}
No. Cert. Digital: ${cfdiComp.getAttribute("NoCertificado")}
Exportacion: ${cfdiComp.getAttribute("Exportacion")}

PRODUCTOS
---
${formatProds(cfdiConceptos)}
---
Moneda: ${cfdiComp.getAttribute("Moneda")}
Subtotal: ${fCurrency(cfdiComp.getAttribute("SubTotal"))}
Impuestos: ${fCurrency(cfdiImpuestos.getAttribute("TotalImpuestosTrasladados"))}
Total: ${fCurrency(cfdiComp.getAttribute("Total"))}

Forma de Pago: ${cfdiComp.getAttribute("FormaPago")}
Metodo de Pago: ${cfdiComp.getAttribute("MetodoPago")}
Cadena Original del complemento de Certificacion Digital del SAT:
||${[
    "Version",
    "UUID",
    "FechaTimbrado",
    "RfcProvCertif",
    "SelloCFD",
    "NoCertificadoSAT",
  ]
    .map((tf) => cfdiComplementoTimbre.getAttribute(tf) || "")
    .join("|")}||
Sello Digital del CFDI: ${cfdiComplementoTimbre.getAttribute("SelloCFD")}
Sello Digital del SAT: ${cfdiComplementoTimbre.getAttribute("SelloSAT")}
No. Serie Certificado SAT: ${cfdiComplementoTimbre.getAttribute(
    "NoCertificadoSAT"
  )}
RFC del PAC: ${cfdiComplementoTimbre.getAttribute("RfcProvCertif")}

*** Este documento es una representacion impresa de un CFDI ***
`;
};

// ----------------------------------------------------------------------

type InvoiceDetailsViewProps = {
  ordenId: string;
};

const InvoiceDetailsView: React.FC<InvoiceDetailsViewProps> = ({ ordenId }) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openOptions, setOpenOptions] = useState(false);
  const [notFound, setNotFound] = useState<boolean>(true);
  const [canceledInvoices, setCanceledInvoices] = useState<InvoiceType[]>([]);
  const [cancelPopoverOpen, setCancelPopoverOpen] = useState<boolean>(false);
  const [ordenInvoice, setOrdenInvoice] = useState<InvoiceType | null>(null);
  const {
    ordenDetails,
    invoiceDetails,
    invoiceDetailsNotFound,
    isLoading,
    invoiceExecStatus,
    activeInvoicesOrden,
  } = useAppSelector((state) => state.orden);
  const { units, editUnit: invoicingUnit } = useAppSelector(
    (state) => state.account
  );
  const [invoiceFunctActive, setInvoiceFunctActive] = useState<boolean>(false);

  // dispatch action to get orden details
  useEffect(() => {
    if (!sessionToken) return;
    dispatch(getInvoiceDetails(ordenId, sessionToken));
    dispatch(getInvoiceExecStatus(ordenId, sessionToken));
    dispatch(getInvoicesByOrden(ordenId, sessionToken || ""));
    // find unit
    if (!ordenDetails) return;
    const _unit = units.find((u: any) => u.id === ordenDetails.supplierUnitId);
    if (!_unit) return;
    dispatch(getUnit(_unit.id, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ordenId, sessionToken]);

  // dispatch action to get orden details
  useEffect(() => {
    const canceledInvoicesFilter: InvoiceType[] = activeInvoicesOrden.filter(
      (invoice: { status: string }) => invoice.status === "CANCELED"
    );
    setCanceledInvoices(canceledInvoicesFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeInvoicesOrden]);

  // invoice details
  useEffect(() => {
    setOrdenInvoice(invoiceDetails);
  }, [invoiceDetails]);

  // invoicing info
  useEffect(() => {
    if (!invoicingUnit.id || invoicingUnit.id === "") return;
    setInvoiceFunctActive(
      invoicingUnit.certificateFile !== undefined &&
        invoicingUnit.secretsFile !== undefined
    );
  }, [invoicingUnit]);

  // destructor
  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear or reset the variables when leaving the page
      dispatch(clearActiveInvoicesOrden());
      dispatch(clearInvoiceDetailsSuccess());
      // Additional cleanup if needed
    };
  }, [dispatch]);

  // not found
  useEffect(() => {
    setNotFound(invoiceDetailsNotFound);
  }, [invoiceDetailsNotFound]);

  // handlers
  const handleGenerateInvoice = async () => {
    enqueueSnackbar("Generando factura...", {
      variant: "info",
      autoHideDuration: 500,
    });
    track("checkout_progress", {
      visit: window.location.toString(),
      page: "OrdenDetails",
      section: "InvoiceDetails",
      ordenId,
    });
    try {
      await dispatch(triggerGenerateInvoice(ordenId, sessionToken || ""));
      // enqueueSnackbar("Factura generada con éxito", { variant: "success" });
      dispatch(getInvoiceDetails(ordenId, sessionToken || ""));
      dispatch(getInvoicesByOrden(ordenId, sessionToken || ""));
    } catch (error) {
      enqueueSnackbar("Error al generar factura", { variant: "error" });
    }
  };

  const handleConfirmCancelInvoice = async () => {
    try {
      setCancelPopoverOpen(false);
      await dispatch(cancelInvoice(ordenId, sessionToken || ""));
      enqueueSnackbar("Factura cancelada con éxito", { variant: "success" });
      dispatch(getInvoiceDetails(ordenId, sessionToken || ""));
      dispatch(getInvoicesByOrden(ordenId, sessionToken || ""));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Error: La factura tiene complemento") {
          enqueueSnackbar(
            "Error al cancelar factura, la factura tiene complemento",
            { variant: "error" }
          );
        }
      } else {
        enqueueSnackbar("Error al cancelar factura", { variant: "error" });
      }
    }
  };

  const handleCloseCancelInvoicePopover = () => {
    setCancelPopoverOpen(false);
  };

  const handlePrintInvoice = () => {
    const _handlePrintInvoice = async () => {
      if (!ordenInvoice?.xmlFile) {
        enqueueSnackbar("No hay factura para imprimir", { variant: "warning" });
        return;
      }
      // read xml file and turn it into string
      const invoiceXmlStr = await fileToString(ordenInvoice.xmlFile);
      const invoiceStr = formatTicketInvoiceDetails(invoiceXmlStr);
      const blob = new Blob([invoiceStr], { type: "text/plain" });
      const data = {
        files: [
          new File(
            [blob],
            `Factura-${ordenInvoice?.folio || ""}-${fISODate(
              ordenDetails.deliveryDate
            )}.txt`,
            {
              type: blob.type,
            }
          ),
        ],
        title: `Factura-${ordenInvoice?.folio || ""}-${fISODate(
          ordenDetails.deliveryDate
        )}`,
      };
      // share
      if (navigator.canShare && navigator.canShare(data)) {
        navigator
          .share(data)
          .then(() => {
            enqueueSnackbar("Factura se ha enviado a imprimir", {
              variant: "success",
            });
          })
          .catch((error) => {
            console.log("Issues sharing to print invoice", error);
            enqueueSnackbar("Error al enviar a imprimir", {
              variant: "error",
            });
          });
      } else {
        enqueueSnackbar(
          "Lo sentimos, la función de Imprimir Factura es sólo para teléfono móvil",
          {
            variant: "warning",
          }
        );
      }
    };
    void _handlePrintInvoice();
  };

  const options = [
    {
      label: "Cancelar Factura",
      active: true,
      action: () => {
        setCancelPopoverOpen(true);
        setOpenOptions(false);
        track("refund", {
          visit: window.location.toString(),
          page: "InvoiceDetails",
          section: "Actions",
        });
      },
    },
    {
      label: "Editar y Refacturar",
      active: true,
      action: () => {
        navigate(PATH_APP.invoice.reInvoice.replace(":ordenId", ordenId));
        setOpenOptions(false);
        track("select_content", {
          visit: window.location.toString(),
          page: "InvoiceDetails",
          section: "Actions",
        });
      },
    },
    {
      label: "Imprimir Factura",
      active: navigator.share,
      action: () => {
        handlePrintInvoice();
        track("select_content", {
          visit: window.location.toString(),
          page: "InvoiceDetails",
          section: "Actions",
        });
      },
    },
  ];

  return (
    <Box>
      {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
      {/* Options Menu */}
      <MenuPopover
        open={openOptions}
        onClose={() => setOpenOptions(false)}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 320 }}
      >
        {options
          .filter((op) => op.active)
          .map((option) => (
            <MenuItem
              key={option.label}
              onClick={option.action}
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              <Grid container spacing={1}>
                <Grid item xs={11} lg={11}>
                  {option.label}
                </Grid>
              </Grid>
            </MenuItem>
          ))}
      </MenuPopover>
      {/* Invoice details */}
      {!notFound && !isLoading && (
        <Box sx={{ my: theme.spacing(4) }}>
          {/* Factura ID */}
          <Typography
            variant="h4"
            sx={{ fontWeight: theme.typography.fontWeightLight }}
          >
            Factura
          </Typography>
          <Typography variant="subtitle1">
            SAT UUID: {ordenInvoice?.uuid || ""}
          </Typography>
          <Typography variant="subtitle2" color={"text.secondary"}>
            Folio: {ordenInvoice?.folio || ""}
          </Typography>

          {/* Cliente */}
          <Grid container>
            <Grid item xs={6} sm={6}>
              <Typography
                variant="overline"
                paragraph
                sx={{ color: "text.disabled", mb: theme.spacing(0) }}
              >
                Cliente
              </Typography>
              <Typography variant="body1">
                <b>{ordenInvoice?.client?.branchName || ""}</b>
              </Typography>
              <Typography
                variant="overline"
                paragraph
                sx={{
                  color: "text.disabled",
                  mb: theme.spacing(0),
                  mt: theme.spacing(1),
                }}
              >
                Estátus de Factura
              </Typography>
              <Box display="flex" alignItems="center">
                {ordenInvoice?.status === InvoiceStatusTypes.ACTIVE && (
                  <>
                    <CheckCircle color="success" />
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      Activa
                    </Typography>
                  </>
                )}
                {ordenInvoice?.status === InvoiceStatusTypes.CANCELED && (
                  <>
                    <Cancel color="error" />
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      Cancelada
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>

            {/* Tipo de Orden */}
            <Grid item xs={6} sm={6}>
              <Typography
                variant="overline"
                paragraph
                sx={{
                  color: "text.disabled",
                  mb: theme.spacing(0),
                  mt: theme.spacing(0),
                }}
              >
                Total de Factura
              </Typography>
              <Box>
                <Typography variant="subtitle2">
                  {fCurrency(ordenInvoice?.total)}
                </Typography>
              </Box>
              <Typography
                variant="overline"
                paragraph
                sx={{
                  color: "text.disabled",
                  mb: theme.spacing(0),
                  mt: theme.spacing(1),
                }}
              >
                Tipo de Pago
              </Typography>
              <Box>
                <Typography variant="subtitle2">
                  {
                    paymentMethods[
                      (ordenDetails?.paymentMethod?.toLowerCase() ||
                        "TBD") as paymentMethodType
                    ]
                  }
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Actions */}
          <Grid container sx={{ mt: 8 }}>
            <Grid item xs={0} md={1} />
            {/* Download xml */}
            <Grid item xs={6} md={3} sx={{ px: theme.spacing(0.5) }}>
              {ordenInvoice?.xmlFile && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={() => {
                    const xmlUri = createBlobURI(ordenInvoice.xmlFile as File);
                    // download from URI
                    const link = document.createElement("a");
                    link.href = xmlUri;
                    link.download =
                      ordenInvoice?.xmlFile?.name || "factura.xml";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Descargar XML
                </Button>
              )}
            </Grid>
            {/* Download pdf */}
            <Grid item xs={6} md={3} sx={{ px: theme.spacing(0.5) }}>
              {ordenInvoice?.pdfFile && (
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={() => {
                    const pdfUri = createBlobURI(ordenInvoice.pdfFile as File);
                    // download from URI
                    const link = document.createElement("a");
                    link.href = pdfUri;
                    link.download =
                      ordenInvoice?.pdfFile?.name || "factura.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Descargar PDF
                </Button>
              )}
            </Grid>
            {/* options btn */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ px: theme.spacing(0.5), pt: { xs: 1, md: 0 } }}
            >
              <Button
                fullWidth
                variant="outlined"
                color="info"
                onClick={() => {
                  setOpenOptions(true);
                }}
                ref={anchorRef}
                endIcon={<MoreVert />}
                sx={{
                  color: theme.palette.grey[500],
                  borderColor: theme.palette.grey[500],
                }}
              >
                Opciones
              </Button>
            </Grid>
            <Grid item xs={0} md={1} />
          </Grid>
        </Box>
      )}

      {/* No Invoice message */}
      {notFound && !isLoading && (
        <Box sx={{ my: theme.spacing(4), textAlign: "center" }}>
          <Typography variant="h5" align="center">
            No hay ninguna factura asociada.
          </Typography>
          <Grid container>
            <Grid item xs={12} md={3} />
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  {invoiceFunctActive && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      onClick={handleGenerateInvoice}
                      sx={{ mt: theme.spacing(2) }}
                    >
                      Generar Factura
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12} md={12}>
                  {canceledInvoices.length > 0 && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      sx={{ mt: theme.spacing(-1) }}
                      onClick={() => {
                        navigate(
                          PATH_APP.invoice.reInvoice.replace(
                            ":ordenId",
                            ordenId
                          )
                        );
                        track("view_item", {
                          visit: window.location.toString(),
                          page: "ReInvoice",
                          section: "FixedAddButton",
                        });
                      }}
                    >
                      Editar y Refacturar
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {invoicingUnit &&
            invoicingUnit.invoicingTrigger === "deactivated" && (
              <Box sx={{ mt: theme.spacing(6) }}>
                <Alert severity="info" sx={{ alignContent: "center" }}>
                  La facturación automática de este CEDIS (
                  <b>{invoicingUnit.unitName}</b>) está desactivada.
                </Alert>
              </Box>
            )}

          {invoiceExecStatus?.id && (
            <Box sx={{ mt: theme.spacing(2) }}>
              {invoiceExecStatus.status === ExecutionStatusTypes.FAILED && (
                <Alert severity="error" sx={{ alignContent: "left" }}>
                  {displayInvoiceExecutionError(invoiceExecStatus.result)} (
                  {invoiceExecStatus?.executionEnd
                    ? fDateTime(invoiceExecStatus.executionEnd)
                    : "Sin fecha de ejecución"}
                  )
                </Alert>
              )}
              {invoiceExecStatus.status === ExecutionStatusTypes.SUCCESS && (
                <Alert severity="success" sx={{ alignContent: "left" }}>
                  La última ejecución de facturación fue exitosa. (
                  {invoiceExecStatus?.executionEnd || "N/A"})
                </Alert>
              )}
              {invoiceExecStatus.status === ExecutionStatusTypes.RUNNING && (
                <Alert severity="info" sx={{ alignContent: "left" }}>
                  La ejecución de la factura está en proceso.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* List of historic invoices */}
      {isLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isLoading && (
        <>
          <DynamicLoader
            elements={canceledInvoices}
            containerSx={{ mt: 4, minHeight: { xs: 540 * 2, md: 800 } }}
            headers={
              <>
                {!isLoading && canceledInvoices.length !== 0 && (
                  <Box sx={{ my: theme.spacing(3), display: "flex" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: theme.typography.fontWeightLight,
                        mt: 4,
                        mb: 2,
                      }}
                    >
                      Facturas Canceladas
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: theme.typography.fontWeightLight,
                        ml: 1,
                        mt: 4,
                        mb: 2,
                        pt: 1,
                      }}
                    >
                      ({canceledInvoices.length})
                    </Typography>
                  </Box>
                )}
              </>
            }
            renderMap={(fInvs) => {
              // group by invoice id
              const groupedInvs = fInvs.reduce((acc: any[], inv: any) => {
                const id = inv.id;
                const inAccIdx = acc.findIndex((i: any) => i.id === id);
                if (inAccIdx === -1) {
                  acc.push({
                    ...inv,
                    relOrdenIds: [inv.associatedOrdenId],
                  });
                } else {
                  acc[inAccIdx].relOrdenIds.push(inv.associatedOrdenId);
                }
                return acc;
              }, []) as (InvoiceType & { relOrdenIds: string[] })[];
              return groupedInvs.map((invoice) => (
                <Box key={invoice.id} sx={{ mb: theme.spacing(2) }}>
                  <InvoiceCardItem invoice={invoice} />
                </Box>
              ));
            }}
          />
        </>
      )}

      {/* Cancel invoice popover */}
      {cancelPopoverOpen && (
        <BasicDialog
          open={cancelPopoverOpen}
          onClose={handleCloseCancelInvoicePopover}
          title="Confirma cancelación de factura"
          msg="¿Estas seguro que quieres cancelar la factura?"
          closeMark={true}
          continueAction={{
            active: true,
            msg: "Cancelar factura",
            actionFn: () => handleConfirmCancelInvoice(),
          }}
        ></BasicDialog>
      )}
    </Box>
  );
};

export default InvoiceDetailsView;
