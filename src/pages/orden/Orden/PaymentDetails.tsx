import { useEffect, useRef, useState } from "react";
// material
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
// redux
import {
  getInvoiceDetails,
  getOrdenDetails,
  getPaymentDetails,
  submitUpdateOrdenPaymentMethod,
  updateOrdenPaystatus,
} from "../../../redux/slices/orden";
// hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// domain
import {
  ComplementPaymentType,
  InvoiceType,
  PayStatusType,
  PaymentReceiptOrdenType,
  PaymentReceiptType,
  paymentMethodType,
  paymentMethods,
  paymentStatusTypes,
} from "../../../domain/orden/Orden";
// components
import BasicDialog from "../../../components/navigation/BasicDialog";
import LoadingProgress from "../../../components/LoadingProgress";
// utils
import track from "../../../utils/analytics";
import { fCurrency, fDateTime } from "../../../utils/helpers";
import PaymentReceiptFormModal from "../../../components/payment/PaymentReceiptFormModal";
import PaymentReceiptCardItem from "../../../components/payment/PaymentReceiptCardItem";
import PickPaymentMethodSection from "../../../components/orden/PickPaymentMethod";
import { UnitStateType } from "../../../domain/account/SUnit";

// ----------------------------------------------------------------------

type PaymentDetailsViewProps = {
  ordenId: string;
};

const PaymentDetailsView: React.FC<PaymentDetailsViewProps> = ({ ordenId }) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const fetched = useRef(false);
  const dispatch = useAppDispatch();
  const [ordenPayment, setOrdenPayment] = useState<
    (PayStatusType & { receipts?: PaymentReceiptType[] }) | null
  >(null);
  const [openStatusDialog, setOpenStatusDialog] = useState<boolean>(false);
  const [openPaymentStatusDialog, setOpenPaymentStatusDialog] =
    useState<boolean>(false);
  const [openAddReceiptDialog, setOpenAddReceiptDialog] =
    useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<undefined | UnitStateType>(
    undefined
  );
  const [updatedStatus, setUpdatedStatus] = useState<string>("");
  const { ordenDetails, paymentStatusDetails, isLoading, invoiceDetails } =
    useAppSelector((state) => state.orden);
  const [ordenInvoice, setOrdenInvoice] = useState<InvoiceType | null>(null);
  const { units } = useAppSelector((state) => state.account);
  const [editReceipt, setEditReceipt] = useState(false);
  // const [complement, setComplement] = useState(false);
  const [payReceiptState, setPayReceiptState] = useState<PaymentReceiptType>({
    paymentValue: ordenDetails.total,
    ordenes: [
      {
        ordenId: ordenDetails.ordenId,
      } as PaymentReceiptOrdenType,
    ],
  });
  // dispatch action to get orden details
  useEffect(() => {
    if (!sessionToken) return;
    dispatch(getPaymentDetails(ordenId, sessionToken));
    dispatch(getInvoiceDetails(ordenId, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ordenId, sessionToken]);

  // invoice details
  useEffect(() => {
    if (invoiceDetails) {
      setOrdenInvoice(invoiceDetails);
    }
  }, [invoiceDetails]);

  useEffect(() => {
    if (units.length > 0 && ordenDetails.id) {
      const selUnit = units.find(
        (unit: UnitStateType) => unit.id === ordenDetails.supplierUnitId
      );
      setSelectedUnit(selUnit);
    }
  }, [units, ordenDetails]);

  // on fetch ordenDetails
  useEffect(() => {
    if (!ordenDetails.ordenId) {
      if (fetched.current) return;
      if (!sessionToken) return;
      dispatch(getOrdenDetails(ordenId, sessionToken));
      fetched.current = true;
    }
    setPayReceiptState({
      paymentValue: ordenDetails.total,
      ordenes: [
        {
          ordenId: ordenDetails.ordenId,
        } as PaymentReceiptOrdenType,
      ],
    });
  }, [ordenDetails, sessionToken, ordenId, dispatch]);
  // invoice details
  useEffect(() => {
    setOrdenPayment(paymentStatusDetails);
    setUpdatedStatus(paymentStatusDetails?.status || "");
  }, [paymentStatusDetails]);

  // Delivery handlers
  const updateDeliveryDetails = (deliveryDetail: string, value: any) => {
    setPaymentMethod(value);
  };

  const handleUpdatePaymentStatus = async () => {
    track("select_content", {
      visit: window.location.toString(),
      page: "OrdenDetails",
      section: "PaymentDetails",
      ordenId,
    });
    try {
      await dispatch(
        updateOrdenPaystatus(ordenId, sessionToken || "", updatedStatus)
      );
      enqueueSnackbar("Estátus de pago actualizado", {
        variant: "success",
        autoHideDuration: 1000,
      });
      dispatch(getPaymentDetails(ordenId, sessionToken || ""));
      setOpenStatusDialog(false);
    } catch (error) {
      enqueueSnackbar("Error al actualizar pago", {
        variant: "error",
        autoHideDuration: 2000,
      });
      setOpenStatusDialog(false);
    }
  };

  const sendUpdateOrden = async () => {
    if (paymentMethod === "") {
      enqueueSnackbar("Seleccione un método de pago", {
        variant: "error",
        autoHideDuration: 1000,
      });
    }
    try {
      await dispatch(
        submitUpdateOrdenPaymentMethod(
          ordenId,
          paymentMethod,
          sessionToken || ""
        )
      );
      enqueueSnackbar("Metodo de pago actualizado", {
        variant: "success",
        autoHideDuration: 1000,
      });
      dispatch(getPaymentDetails(ordenId, sessionToken || ""));
      setOpenPaymentStatusDialog(false);
    } catch (error) {
      enqueueSnackbar("Error al actualizar método de pago", {
        variant: "error",
        autoHideDuration: 2000,
      });
      setOpenPaymentStatusDialog(false);
    }
  };

  return (
    <Box>
      {isLoading && <LoadingProgress sx={{ my: 2 }} />}
      {/* Update status dialog */}
      <BasicDialog
        title="Actualizar estatus de pago"
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        closeMark={true}
        msg="Selecciona el estátus de pago que deseas actualizar."
        continueAction={{
          active: true,
          msg: "Actualizar",
          actionFn: handleUpdatePaymentStatus,
        }}
        backAction={{
          active: true,
          msg: "Cancelar",
          actionFn: () => setOpenStatusDialog(false),
        }}
      >
        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            select
            label="Estátus de pago"
            value={updatedStatus}
            onChange={(e) => setUpdatedStatus(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ mb: theme.spacing(2) }}
          >
            {Object.keys(paymentStatusTypes).map((status) => (
              <option key={status} value={status}>
                {paymentStatusTypes[status as keyof typeof paymentStatusTypes]}
              </option>
            ))}
          </TextField>
        </Box>
      </BasicDialog>
      {/* Add paymen receipt dialog */}
      <PaymentReceiptFormModal
        open={openAddReceiptDialog}
        onClose={(valid: boolean) => {
          dispatch(getPaymentDetails(ordenId, sessionToken || ""));
          setPayReceiptState({
            ordenes: [
              {
                ordenId: ordenDetails.ordenId,
              } as PaymentReceiptOrdenType,
            ],
            id: undefined,
            createdAt: undefined,
            createdBy: undefined,
            evidenceFile: undefined,
            lastUpdated: undefined,
            paymentValue: undefined,
          });
          setEditReceipt(false);
          setOpenAddReceiptDialog(false);
        }}
        editMode={editReceipt}
        payReceipt={payReceiptState}
      />
      {/* Payment details */}
      {!isLoading && (
        <>
          <Box sx={{ my: theme.spacing(4) }}>
            {/* Pago ID */}
            <Typography
              variant="h4"
              sx={{ fontWeight: theme.typography.fontWeightLight }}
            >
              Pago
            </Typography>

            {/* Orden */}
            <Grid container>
              <Grid item xs={6} sm={6}>
                <Typography
                  variant="overline"
                  paragraph
                  sx={{ color: "text.disabled", mb: theme.spacing(0) }}
                >
                  ID Orden de Venta:
                </Typography>
                <Typography variant="subtitle1">
                  {ordenPayment?.ordenId || ""}
                </Typography>
                {ordenDetails.ordenNumber ? (
                  <>
                    <Typography
                      variant="overline"
                      paragraph
                      sx={{ color: "text.disabled", mb: theme.spacing(0) }}
                    >
                      {" "}
                      # Pedido
                    </Typography>
                    <Typography variant="subtitle2">
                      <b>{ordenDetails.ordenNumber}</b>
                    </Typography>
                  </>
                ) : null}
                {ordenDetails.total && (
                  <>
                    <Typography
                      variant="overline"
                      paragraph
                      sx={{
                        color: "text.disabled",
                        mb: theme.spacing(0),
                        mt: theme.spacing(1),
                      }}
                    >
                      Total del Pedido
                    </Typography>

                    <Typography variant="subtitle2">
                      {fCurrency(ordenDetails.total)}
                    </Typography>
                  </>
                )}

                {ordenPayment?.createdBy && (
                  <>
                    <Typography
                      variant="overline"
                      paragraph
                      sx={{
                        color: "text.disabled",
                        mb: theme.spacing(0),
                        mt: theme.spacing(1),
                      }}
                    >
                      Últ. Actualización por
                    </Typography>

                    <Typography variant="subtitle1">
                      {ordenPayment.createdBy.firstName}{" "}
                      {ordenPayment.createdBy.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({fDateTime(ordenPayment?.createdAt || "")})
                    </Typography>
                  </>
                )}
              </Grid>

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
                  Estátus
                </Typography>
                <Box display="flex" alignItems="center">
                  {ordenPayment?.status?.toLowerCase() === "paid" && (
                    <>
                      <CheckCircle color="success" />
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {paymentStatusTypes.paid}
                      </Typography>
                    </>
                  )}
                  {ordenPayment?.status?.toLowerCase() === "unpaid" && (
                    <>
                      <Cancel color="error" />
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {paymentStatusTypes.unpaid}
                      </Typography>
                    </>
                  )}
                  {ordenPayment?.status?.toLowerCase() === "partially_paid" && (
                    <>
                      <Cancel color="warning" />
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {paymentStatusTypes.partially_paid}
                      </Typography>
                    </>
                  )}
                  {ordenPayment?.status?.toLowerCase() === "unknown" && (
                    <>
                      <Cancel color="disabled" />
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {paymentStatusTypes.unknown}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="overline"
                    paragraph
                    sx={{
                      color: "text.disabled",
                      mb: theme.spacing(0),
                      mt: theme.spacing(0),
                    }}
                  >
                    Tipo de Pago
                  </Typography>
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
          </Box>
          {/* Actions */}
          <Grid container>
            <Grid item xs={0} md={1} />
            {/* update status */}
            <Grid item xs={12} md={3} sx={{ pr: { xs: 0, md: 2 } }}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                onClick={() => setOpenStatusDialog(true)}
              >
                Actualizar Estátus
              </Button>
            </Grid>
            {/* add receipt */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ pt: { xs: 2, md: 0 }, pr: { xs: 0, md: 2 } }}
            >
              <Button
                fullWidth
                variant="contained"
                color="info"
                onClick={() => setOpenAddReceiptDialog(true)}
              >
                Cargar Comprobante
              </Button>
            </Grid>
            {/* If NO Invoice, allow to chance payment method  */}
            {!ordenInvoice ||
            Object.keys(ordenInvoice).length === 0 ||
            ordenInvoice?.status === "CANCELED" ? (
              <Grid item xs={12} md={3} sx={{ pt: { xs: 2, md: 0 } }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenPaymentStatusDialog(true)}
                >
                  Editar Método de Pago
                </Button>
              </Grid>
            ) : null}
          </Grid>
        </>
      )}

      {/* No Payment message */}
      {!isLoading && !ordenPayment?.receipts && (
        <Box
          sx={{
            mt: theme.spacing(4),
            mb: theme.spacing(2),
            textAlign: "center",
          }}
        >
          <Typography variant="h5" align="center">
            No hay ningún comprobante de pago asociado.
          </Typography>
        </Box>
      )}

      {/* Payment receipts */}
      {!isLoading &&
        ordenPayment?.receipts &&
        ordenPayment.receipts.length > 0 && (
          <Box>
            <Box sx={{ display: "flex" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: theme.typography.fontWeightLight,
                  mt: 4,
                  mb: 2,
                }}
              >
                Comprobantes
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
                (Suma Total:&nbsp;
                {fCurrency(
                  ordenPayment.receipts
                    .map((r) => r.paymentValue)
                    .reduce((a, b) => (a || 0) + (b || 0), 0)
                )}
                )
              </Typography>
            </Box>
            {/* List of orden receipts */}
            {ordenPayment.receipts.map((receipt, i) => {
              const acc: ComplementPaymentType[] = [];
              if (receipt.ordenes) {
                receipt.ordenes.map((ord) => {
                  // if doesnot exist -> add to array
                  if (ord.complement) {
                    acc.push(ord.complement!);
                  }
                  return acc;
                });
              }
              if (acc.length > 0) {
                return (
                  <Box key={i} sx={{ px: { xs: 0, md: 5 } }}>
                    <PaymentReceiptCardItem
                      receipt={receipt}
                      options={undefined}
                    />
                  </Box>
                );
              } else
                return (
                  <Box key={i} sx={{ px: { xs: 0, md: 5 } }}>
                    <PaymentReceiptCardItem
                      receipt={receipt}
                      options={[
                        {
                          label: "Editar Comprobante",
                          onClick: () => {
                            setPayReceiptState(receipt);
                            setEditReceipt(true);
                            setOpenAddReceiptDialog(true);
                          },
                        },
                      ]}
                    />
                  </Box>
                );
            })}
          </Box>
        )}
      {
        <BasicDialog
          open={openPaymentStatusDialog}
          onClose={() => {
            setOpenPaymentStatusDialog(false);
          }}
          continueAction={{
            active: true,
            msg: "Actualizar Metodo de pago",
            actionFn: () => sendUpdateOrden(),
          }}
          title="Asignar CEDIS"
        >
          {selectedUnit ? (
            <PickPaymentMethodSection
              supUnit={selectedUnit}
              paymentMethod={paymentMethod}
              updatePaymentMethod={updateDeliveryDetails}
            />
          ) : null}
        </BasicDialog>
      }
    </Box>
  );
};

export default PaymentDetailsView;
