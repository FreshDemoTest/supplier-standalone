import React, { Fragment, useEffect, useRef, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { Box, Container, Typography } from "@mui/material";
import MoreVerticalFill from "@iconify/icons-eva/more-vertical-fill";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Icon } from "@iconify/react";
// hooks
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// redux
import {
  exportPriceListFile,
  getAllUnitsPriceLists,
  clearExportPriceListSuccess,
} from "../../../redux/slices/supplier";
import { getActiveClients } from "../../../redux/slices/client";
// components
import Page from "../../../components/Page";
import LoadingProgress from "../../../components/LoadingProgress";
import PriceListTable from "../../../components/supplier/PriceListTable";
import MHidden from "../../../components/extensions/MHidden";
import MenuPopover from "../../../components/MenuPopover";
// domain
import {
  PriceListDetailsType,
  SupplierPriceListStateType,
} from "../../../domain/supplier/SupplierPriceList";
import { ClientProfileType } from "../../../domain/client/Client";
// routes & utils
import { PATH_APP } from "../../../routes/paths";
import { createBlobURI, inXTime } from "../../../utils/helpers";
import BasicDialog from "../../../components/navigation/BasicDialog";
import { mixtrack } from "../../../utils/analytics";
import { enqueueSnackbar } from "notistack";
import SupplierProductPriceListToolbar from "../../../components/supplier/SupplierProductPriceListToolbar";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: "100%", // 960
  margin: "auto",
  display: "flex",
  minHeight: "100%",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(0, 0),
}));

// ----------------------------------------------------------------------

export default function PriceListDetails() {
  const fetchedPLs = useRef(false);
  const fetchedCls = useRef(false);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { priceListId } = useParams<{ priceListId: string }>();
  const { sessionToken } = useAuth();
  const theme = useTheme();
  const { supplierPricesLists } = useAppSelector((state) => state.supplier);
  const { units, business } = useAppSelector((state) => state.account);
  const { activeClients } = useAppSelector((state) => state.client);
  const [downloadPDF, setDownloadPDF] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  // specified price list
  const [priceListState, setPriceListState] = useState<
    SupplierPriceListStateType | undefined
  >(undefined);
  const [sortedProducts, setSortedProducts] = useState<PriceListDetailsType[]>(
    []
  );
  const [notFoundPriceList, setNotFoundPriceList] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [lastUpdatedList, setLastUpdatedList] = useState<Date | undefined>(
    undefined
  );
  const [downloadedCotiz, setDownloadedCotiz] = useState(false);
  const [unitsWithList, setUnitsWithList] = useState<any[]>([]);
  const actUnits = units.filter((u: any) => !u.deleted);
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const { exportPriceList } = useAppSelector((state) => state.supplier);

  const options = [
    {
      label: "Editar Lista",
      onClick: () => {
        navigate(
          PATH_APP.catalog.price.editList.replace(
            ":priceListId",
            priceListId || ""
          )
        );
      },
    },
    {
      label: "Editar Lista con Archivo",
      onClick: () => {
        navigate(
          PATH_APP.catalog.price.editUpload.replace(
            ":priceListId",
            priceListId || ""
          )
        );
      },
    },
    {
      label: "Descargar Archivo de Lista",
      onClick: () => {
        setOpenDownloadDiag(true);
      },
    },
    {
      label: "Descargar Cotización",
      onClick: () => {
        setDownloadPDF(true);
      },
    },
  ];

  // hook - download file
  useEffect(() => {
    if (exportPriceList.loaded && exportPriceList.file) {
      // generate url
      const _blobUrl = createBlobURI(exportPriceList.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportPriceList.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportPriceListSuccess());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportPriceList]);

  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(
        exportPriceListFile(
          xformat,
          units[0].id,
          priceListId || "",
          sessionToken || ""
        )
      );
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      mixtrack(`download_price_list_${xformat}`, {
        visit: window.location.toString(),
        page: "Price List view",
        section: "Options",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      mixtrack(`error_download_price_list_${xformat}`, {
        visit: window.location.toString(),
        page: "Price List View",
        section: "Options",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // hook to fetch price lists
  useEffect(() => {
    if (!sessionToken || actUnits.length === 0 || fetchedPLs.current) return;
    dispatch(
      getAllUnitsPriceLists(
        actUnits.map((u: any) => u.id),
        sessionToken
      )
    );
    fetchedPLs.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, units, dispatch]);

  // hook to get active clients
  useEffect(() => {
    if (!sessionToken || fetchedCls.current || actUnits.length === 0) return;
    dispatch(
      getActiveClients(
        actUnits.map((u: any) => u.id),
        sessionToken
      )
    );
    fetchedCls.current = true;
  }, [sessionToken, dispatch, actUnits]);

  // on change price lists
  useEffect(() => {
    if (!priceListId || !sessionToken || supplierPricesLists.length === 0)
      return;
    const priceList = supplierPricesLists.find(
      (pl: any) => pl.id === priceListId
    );
    if (!priceList) {
      setNotFoundPriceList(true);
      return;
    }
    setPriceListState({
      ...priceList,
      resBranches: priceList.clients.map((b: any) => b.id.toString()),
      validUntil: new Date(priceList.validUpto),
    });
    setLastUpdatedList(new Date(priceList.lastUpdated));
  }, [priceListId, sessionToken, supplierPricesLists]);

  // hook - update units with same price list
  useEffect(() => {
    if (!priceListState || !actUnits || !supplierPricesLists) return;
    // verify which lists
    // -- filter lists with current name
    const _flists = supplierPricesLists.filter(
      (pl: any) => pl.listName === priceListState.listName
    );
    // -- get the units of those lists
    const _units = _flists.map((pl: any) => pl.supplierUnitId);
    // -- set units with list
    const _unitsWithList = actUnits.filter((u: any) => _units.includes(u.id));
    setUnitsWithList(_unitsWithList);

    // set sorted products
    const _sortedProducts = [...priceListState.pricesDetails];
    _sortedProducts.sort((a, b) => {
      return a.description.localeCompare(b.description);
    });
    setSortedProducts(_sortedProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceListState]);

  // render vars
  // expired
  const isExpired = priceListState?.validUntil
    ? new Date(priceListState?.validUntil) < new Date()
    : false;
  // in 2 days but not expired
  const isExpiring = priceListState?.validUntil
    ? new Date(priceListState?.validUntil) < inXTime(2) && !isExpired
    : false;

  return (
    <>
      {!priceListState && !notFoundPriceList && <LoadingProgress />}
      {priceListState && !notFoundPriceList && (
        <RootStyle title="Detalle Lista de Precios | Alima">
          <MenuPopover
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            anchorEl={anchorRef.current || undefined}
            sx={180}
          >
            {options?.map((option) => {
              const { label, onClick } = option;
              return (
                <MenuItem
                  key={label}
                  onClick={() => {
                    if (onClick) {
                      onClick();
                    }
                    setOpenMenu(false);
                  }}
                  sx={{ typography: "body2", py: 1, px: 2.5 }}
                >
                  {label}
                </MenuItem>
              );
            })}
          </MenuPopover>
          <Container>
            <ContentStyle>
              <Box
                sx={{
                  mb: theme.spacing(2),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flexGrow: 1, my: 2 }}>
                  <Grid container>
                    <Grid item xs={11} md={10}>
                      {/* List name */}
                      <Box
                        sx={{
                          pr: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            fontWeight: theme.typography.fontWeightRegular,
                          }}
                        >
                          Lista de Precios:&nbsp;{" "}
                        </Typography>
                        <Typography variant="h4" color="text.secondary">
                          {priceListState?.listName}
                        </Typography>
                      </Box>
                      <Grid container>
                        <Grid item xs={12} md={4}>
                          {/* Valid until */}
                          <Typography
                            variant="body2"
                            sx={{ mt: 1 }}
                            color="text.secondary"
                          >
                            Válida hasta{" "}
                            <b>
                              {priceListState?.validUntil?.toLocaleDateString()}
                            </b>
                          </Typography>

                          {/* Last updated */}
                          <Typography
                            variant="caption"
                            sx={{ mt: 1 }}
                            color="text.secondary"
                          >
                            Últ. Actualización{" "}
                            {lastUpdatedList?.toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          {isExpiring && (
                            <Chip
                              icon={<RunningWithErrorsIcon color="info" />}
                              color="info"
                              sx={{
                                fontWeight: theme.typography.fontWeightMedium,
                              }}
                              label={"Por expirar"}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {isExpired && (
                            <Chip
                              icon={<RunningWithErrorsIcon color="error" />}
                              color="error"
                              sx={{
                                fontWeight: theme.typography.fontWeightMedium,
                              }}
                              label={"Expirada"}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* Options */}
                    <Grid item xs={1} md={2}>
                      {/* Desktop */}
                      <MHidden width="mdDown">
                        <Button
                          size="small"
                          ref={anchorRef}
                          variant="outlined"
                          sx={{
                            mt: 2,
                            color: theme.palette.grey[500],
                            borderColor: theme.palette.grey[500],
                          }}
                          onClick={() => setOpenMenu(true)}
                        >
                          Ver Opciones
                        </Button>
                      </MHidden>
                      {/* Mobile */}
                      <MHidden width="mdUp">
                        <IconButton
                          ref={anchorRef}
                          onClick={() => setOpenMenu(true)}
                        >
                          <Icon icon={MoreVerticalFill} />
                        </IconButton>
                      </MHidden>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Divider sx={{ mb: theme.spacing(2) }} />
              <Grid container>
                {/* Units */}
                <Grid item xs={12} md={6} sx={{ pr: { xs: 0, md: 10 } }}>
                  <Typography variant="h6" color="text.secondary">
                    CEDIS asignados
                  </Typography>
                  <Box sx={{ mt: 1, width: "100%" }}>
                    {unitsWithList.map((ac: any) => {
                      return (
                        <Chip
                          key={ac.id}
                          label={ac.unitName}
                          sx={{
                            mr: 1,
                            mb: 1,
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.text.secondary,
                          }}
                        />
                      );
                    })}
                  </Box>
                  <Divider sx={{ my: theme.spacing(2) }} />

                  {!priceListState.isDefault && (
                    <Fragment>
                      {/* Clientes */}
                      <Typography variant="h6" color="text.secondary">
                        Clientes
                      </Typography>
                      <Table sx={{ width: "100%", mt: 1 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Negocio</TableCell>
                            <TableCell>Sucursal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeClients
                            .filter((ac: ClientProfileType) => {
                              return priceListState?.resBranches?.includes(
                                ac?.id || ""
                              );
                            })
                            .map((ac: ClientProfileType) => {
                              return (
                                <TableRow key={ac.id}>
                                  <TableCell>
                                    <Typography variant="body2" key={ac.id}>
                                      {ac.displayName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" key={ac.id}>
                                      {ac.branchName}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </Fragment>
                  )}
                  {priceListState.isDefault && (
                    <Fragment>
                      <Chip
                        label={"Por defecto"}
                        color="primary"
                        size="medium"
                        sx={{
                          fontWeight: theme.typography.fontWeightMedium,
                        }}
                        icon={<CheckCircleRoundedIcon color="primary" />}
                        variant="outlined"
                      />
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Esta lista de precios es la que se asigna por defecto a
                        todos los clientes que no tienen una lista de precios
                        asignada.
                      </Alert>
                      <Divider sx={{ my: theme.spacing(2) }} />
                    </Fragment>
                  )}
                </Grid>
                {/* Productos */}
                <Grid item xs={12} md={6} sx={{ mt: { xs: 1, md: 0 } }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Productos ({sortedProducts.length})
                  </Typography>
                  <PriceListTable prices={sortedProducts} />
                </Grid>
              </Grid>
            </ContentStyle>
          </Container>
        </RootStyle>
      )}

      {/* Export PDF Price list */}

      <BasicDialog
        title="Descarga de Lista de Precios"
        open={downloadPDF}
        onClose={() => setDownloadPDF(false)}
        closeMark={true}
        continueAction={{
          active: downloadedCotiz,
          msg: "Continuar",
          actionFn: () => {
            setDownloadPDF(false);
            setDownloadedCotiz(false);
          },
        }}
        msg={
          downloadedCotiz
            ? `Tu Cotización ha sido descargada, ¿deseas continuar?`
            : ""
        }
      >
        {priceListState !== undefined && !downloadedCotiz ? (
          <SupplierProductPriceListToolbar
            priceList={priceListState}
            units={units}
            activeClients={activeClients}
            showButtons={false}
            onDownloadedPDF={(flag: boolean) => {
              setDownloadedCotiz(flag);
            }}
            business={business}
          />
        ) : null}
      </BasicDialog>

      {notFoundPriceList && (
        <RootStyle title="Lista de Precios no Encontrada | Alima">
          <Container>
            <ContentStyle>
              <Box
                sx={{
                  mb: theme.spacing(2),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    No se encontró la lista de precios, verifica que el link sea
                    correcto.
                  </Typography>
                </Box>
              </Box>
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
      <BasicDialog
        closeMark
        open={openDownloadDiag}
        onClose={() => setOpenDownloadDiag(false)}
        title={"Descargar Productos"}
        msg={"Selecciona el formato de descarga de tu productos"}
        continueAction={{
          active: true,
          msg: "Excel (XLSX)",
          actionFn: () => handleDownloadExport("xlsx"),
        }}
        backAction={{
          active: true,
          msg: "CSV",
          actionFn: () => handleDownloadExport("csv"),
        }}
      ></BasicDialog>
    </>
  );
}
