import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { Box, Container, Link, Typography } from '@mui/material';
// hooks
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import useAuth from '../../../hooks/useAuth';
// routes
import { PATH_APP } from '../../../routes/paths';
// redux
import {
  getAllUnitsPriceLists,
  getProductCatalog
} from '../../../redux/slices/supplier';
import { getActiveClients } from '../../../redux/slices/client';
// components
import Page from '../../../components/Page';
import BasicDialog from '../../../components/navigation/BasicDialog';
// utils
import { delay } from '../../../utils/helpers';
import SupplierProductStockFileForm from '../../../components/supplier/SupplierStockFileForm';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
const TemplateFilename =
  'https://docs.google.com/spreadsheets/d/1qj-AJKN1RTLWOC0AlfJSyJJzpm72MO1-W6knLX5Thto/export?format=xlsx';

// const UploadManualFile =
//   'https://docs.google.com/document/d/1MO5nI22PH0jE2sX-234czzzJxfcATvf-jWD_yKTmQ-0/export?format=pdf';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 720,
  margin: 'auto',
  display: 'flex',
  minHeight: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(0, 0)
}));

// ----------------------------------------------------------------------

export default function AddStockByFile() {
  const fetchedPLs = useRef(false);
  const fetchedCls = useRef(false);
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { batchSupplierProductStockFeedback } =
    useAppSelector((state) => state.supplier);
  const { units } = useAppSelector((state) => state.account);
  // const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
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

  const handleSuccess = (validationReminder: boolean = true) => {
    if (validationReminder) {
      setOpenConfirmDiag(true);
      dispatch(getProductCatalog(sessionToken || ''));
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

      <RootStyle title="Agrega Stock con Archivo | Alima">
        <Container>
          <ContentStyle>
            <Box
              sx={{
                mb: theme.spacing(2),
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Agregar Inventario con Archivo
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ color: 'text.secondary', mt: theme.spacing(1) }}>
              Para agregar tu inventario, descarga el&nbsp;
              <Link
                to={TemplateFilename}
                component={RouterLink}
                download="Carga-de-Proveedores-Alima.xlsx"
                target="_blank"
                rel="noreferrer"
              >
                <b>template de carga de inventario</b>
              </Link>
              , asegurate de incluir el SKU del producto de tu catalogo para
              poderle asignar el inventario deseado.
            </Typography>

            {/* Add Suppliers Price List file Form  */}
            <SupplierProductStockFileForm
              onSuccessCallback={handleSuccess}
            />
            <Box
              sx={{
                mt: theme.spacing(3),
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  ¿Necesitas ayuda?
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', mt: theme.spacing(1) }}
                >
                  Descarga el&nbsp;
                  <Link
                    to={UploadManualFile}
                    component={RouterLink}
                    download="Carga-de-Proveedores-Alima.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <b>manual de carga de precios, productos, e inventario</b>
                  </Link>
                  &nbsp;para obtener más información.
                </Typography>
              </Box> */}
            </Box>
          </ContentStyle>
        </Container>
      </RootStyle>
    </>
  );
}
