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
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// routes
import { PATH_APP } from "../../../routes/paths";
// redux
import { getAllUnitsPriceLists } from "../../../redux/slices/supplier";
import { getActiveClients } from "../../../redux/slices/client";
// components
import Page from "../../../components/Page";
import BasicDialog from "../../../components/navigation/BasicDialog";
import SupplierPriceListForm from "../../../components/supplier/SupplierPriceListForm";
import LoadingProgress from "../../../components/LoadingProgress";
// utils
import { delay } from "../../../utils/helpers";
// domain
import { SupplierPriceListStateType } from "../../../domain/supplier/SupplierPriceList";



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

export default function EditPriceList() {
  const fetchedPLs = useRef(false);
  const fetchedCls = useRef(false);
  const { priceListId } = useParams<{ priceListId: string }>();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { batchSupplierPriceListFeedback, supplierPricesLists } =
    useAppSelector((state) => state.supplier);
  const { units } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  // specified price list
  const [priceListUploadState, setPriceListUploadState] = useState<
    SupplierPriceListStateType | undefined
  >(undefined);
  const [notFoundPriceList, setNotFoundPriceList] = useState(false);
  const actUnits = units.filter((u: any) => !u.deleted);

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
    // set units with this price list
    const _flists = supplierPricesLists.filter(
      (pl: any) => pl.listName === priceList.listName
    );
    const _units = _flists.map((pl: any) => pl.supplierUnitId);
    const _unitsWithList = (actUnits || []).filter((u: any) => _units.includes(u.id));
    setPriceListUploadState({
      ...priceList,
      resBranches: priceList.clients.map((b: any) => b.id.toString()),
      validUntil: new Date(priceList.validUpto),
      supUnitIds: _unitsWithList.map((u: any) => u.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceListId, sessionToken, supplierPricesLists]);

  const handleOnContinue = async () => {
    await delay(500);
    setOpenConfirmDiag(false);
    navigate(PATH_APP.catalog.listPrices);
  };

  return (
    <>
      {/* confirmation dialog */}
      <BasicDialog
        fullWidth={true}
        open={openConfirmDiag}
        onClose={() => setOpenConfirmDiag(false)}
        title="Actualización de Lista de Precios"
        continueAction={{
          active: batchSupplierPriceListFeedback.prices.length > 0,
          msg: "Continuar",
          actionFn: handleOnContinue,
        }}
        backAction={{
          active: true,
          msg: "Regresar",
          actionFn: () => setOpenConfirmDiag(false),
        }}
        closeMark={true}
      >
        <>
          <Box sx={{ mt: theme.spacing(2) }} />
          <Typography variant="subtitle1" sx={{ mb: theme.spacing(2) }}>
            {batchSupplierPriceListFeedback.resMsg}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Resultados de la actualización de precios:
          </Typography>
          <TableContainer sx={{ minWidth: "80%" }}>
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
                {batchSupplierPriceListFeedback.prices.map(
                  (product: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {product.supplierProductPriceId?.slice(10)}
                        </Typography>
                      </TableCell>
                      <TableCell> {product.sku} </TableCell>
                      <TableCell> {product.description} </TableCell>
                      <TableCell> {product.status ? "OK" : "Error"}</TableCell>
                      <TableCell> {product.msg} </TableCell>
                    </TableRow>
                  )
                )}
                {batchSupplierPriceListFeedback.prices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" noWrap>
                        No se actualizaron precios.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </BasicDialog>

      {!priceListUploadState && !notFoundPriceList && <LoadingProgress />}
      {priceListUploadState && !notFoundPriceList && (
        <RootStyle title="Edita Lista de Precios | Alima">
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
                    Edita tu Lista de Precios
                  </Typography>
                </Box>
              </Box>

              {/* Edit Suppliers Price List Form  */}
              <SupplierPriceListForm
                onSuccessCallback={handleSuccess}
                priceLists={supplierPricesLists}
                priceListState={priceListUploadState}
                editMode={true}
              />
            </ContentStyle>
          </Container>
        </RootStyle>
      )}

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
    </>
  );
}
