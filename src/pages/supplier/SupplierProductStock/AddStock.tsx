import { useEffect, useRef, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { Box, Container, Typography } from "@mui/material";
// hooks
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// routes
import { PATH_APP } from "../../../routes/paths";
// redux
import { getAllUnitsPriceLists, getProductStock } from "../../../redux/slices/supplier";
import { getActiveClients } from "../../../redux/slices/client";
// components
import Page from "../../../components/Page";
import BasicDialog from "../../../components/navigation/BasicDialog";
// utils
import { delay } from "../../../utils/helpers";
import SupplierStockListForm from "../../../components/supplier/SupplierStockListForm";
import { enqueueSnackbar } from "notistack";
import { SupplierStockListType } from "../../../domain/supplier/SupplierPriceList";
import LoadingProgress from "../../../components/LoadingProgress";

// ----------------------------------------------------------------------

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

export default function AddStock() {
  const fetchedPLs = useRef(false);
  const fetchedCls = useRef(false);
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { batchSupplierProductStockFeedback, supplierProdsStock } =
    useAppSelector((state) => state.supplier);
  const { units, activeUnit } = useAppSelector((state) => state.account);
  // const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const actUnits = units.filter((u: any) => !u.deleted);
  const [StockListUploadState, setStockListUploadState] = useState<
    SupplierStockListType | undefined
  >(undefined);

  // hook to fetch products
  useEffect(() => {
    if (!sessionToken || !activeUnit) return;
    const _getProds = async () => {
      try {
        await dispatch(getProductStock(activeUnit.id, sessionToken || ""));

      } catch (error) {
        console.error(error);
        enqueueSnackbar("Error al cargar productos", {
          variant: "error",
        });
      }
    };
    _getProds();
  }, [dispatch, sessionToken, activeUnit]);

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
  }, [sessionToken, dispatch, actUnits]);

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
    if (!sessionToken || !activeUnit)
      return;
    setStockListUploadState({
      stock: supplierProdsStock,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, supplierProdsStock]);

  const handleSuccess = (validationReminder: boolean = true) => {
    if (validationReminder) {
      setOpenConfirmDiag(true);
      dispatch(
        getAllUnitsPriceLists(
          actUnits.map((u: any) => u.id),
          sessionToken || ""
        )
      );
    } else {
      handleOnContinue();
    }
  };

  const handleOnContinue = async () => {
    await delay(500);
    setOpenConfirmDiag(false);
    navigate(PATH_APP.catalog.listStock);
  };

  return (
    <>
      {/* confirmation dialog */}
      {/* confirmation dialog */}
      <BasicDialog
        fullWidth={true}
        open={openConfirmDiag}
        onClose={() => setOpenConfirmDiag(false)}
        title="Carga de Inventario"
        continueAction={{
          active: batchSupplierProductStockFeedback.stock.length > 0,
          msg: 'Continuar',
          actionFn: handleOnContinue
        }}
        backAction={{
          active: true,
          msg: 'Regresar',
          actionFn: () => setOpenConfirmDiag(false)
        }}
        closeMark={true}
      >
        <>
          <Box sx={{ mt: theme.spacing(2) }} />
          <Typography variant="subtitle1" sx={{ mb: theme.spacing(2) }}>
            {batchSupplierProductStockFeedback.resMsg}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Resultados de la carga de inventario:
          </Typography>
          <TableContainer sx={{ minWidth: '80%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell> # </TableCell>
                  <TableCell> SKU </TableCell>
                  <TableCell> Descripción </TableCell>
                  <TableCell> Estátus </TableCell>
                  <TableCell> Aviso </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchSupplierProductStockFeedback.stock.map(
                  (product: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {product.supplierProductId?.slice(10)}
                        </Typography>
                      </TableCell>
                      <TableCell> {product.sku} </TableCell>
                      <TableCell> {product.description} </TableCell>
                      <TableCell> {product.status ? 'OK' : 'Error'}</TableCell>
                      <TableCell> {product.msg} </TableCell>
                    </TableRow>
                  )
                )}
                {batchSupplierProductStockFeedback.stock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" noWrap>
                        No se cargo inventario.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </BasicDialog>
        {!StockListUploadState && <LoadingProgress />}
          {StockListUploadState && (
            <RootStyle title="Agrega Inventario | Alima">
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
                        Agregar inventario
                      </Typography>
                    </Box>
                  </Box>

                  {/* Add Suppliers Price List Form  */}
                  <SupplierStockListForm
                    onSuccessCallback={handleSuccess}
                    stockListsState={StockListUploadState}
                    stockLists={supplierProdsStock}
                  />
                </ContentStyle>
              </Container>
            </RootStyle>
          )}</>)
        }
