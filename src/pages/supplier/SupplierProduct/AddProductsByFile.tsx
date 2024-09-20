import { useState } from 'react';
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
import { getProductCatalog } from '../../../redux/slices/supplier';
// components
import Page from '../../../components/Page';
import BasicDialog from '../../../components/navigation/BasicDialog';
import SupplierProductsFileForm from '../../../components/supplier/SupplierProductsFileForm';
// utils
import { delay } from '../../../utils/helpers';

// ----------------------------------------------------------------------

const UploadManualFile =
  'https://docs.google.com/document/d/1MO5nI22PH0jE2sX-234czzzJxfcATvf-jWD_yKTmQ-0/export?format=pdf';

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

export default function AddProductsByFile() {
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { batchSupplierProdFeedback } = useAppSelector(
    (state) => state.supplier
  );
  const dispatch = useAppDispatch();

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
    navigate(PATH_APP.root);
  };

  return (
    <>
      {/* confirmation dialog */}
      <BasicDialog
        fullWidth={true}
        open={openConfirmDiag}
        onClose={() => setOpenConfirmDiag(false)}
        title="Carga de Productos"
        continueAction={{
          active: batchSupplierProdFeedback.products.length > 0,
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
            {batchSupplierProdFeedback.resMsg}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Resultados de la carga de productos:
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
                {batchSupplierProdFeedback.products.map(
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
                {batchSupplierProdFeedback.products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" noWrap>
                        No se cargaron productos.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      </BasicDialog>

      <RootStyle title="Agrega Productos con Archivo | Alima">
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
                  Agregar Productos con Archivo
                </Typography>
              </Box>
            </Box>

            {/* Add Suppliers file Form  */}
            <SupplierProductsFileForm onSuccessCallback={handleSuccess} />
            <Box
              sx={{
                mt: theme.spacing(3),
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
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
                    <b>manual de carga de productos</b>
                  </Link>
                  &nbsp;para obtener más información.
                </Typography>
              </Box>
            </Box>
          </ContentStyle>
        </Container>
      </RootStyle>
    </>
  );
}
