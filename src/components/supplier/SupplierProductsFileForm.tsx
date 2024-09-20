import * as Yup from 'yup';
import { ChangeEvent, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Icon } from '@iconify/react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import closeFill from '@iconify/icons-eva/close-fill';
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
  Link
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { setBatchSupplierProductFile } from '../../redux/slices/supplier';
// hooks
import { useAppDispatch } from '../../redux/store';
import useAuth from '../../hooks/useAuth';
// utils
import { delay } from '../../utils/helpers';
import { AlimaAPITokenError } from '../../errors';

// ----------------------------------------------------------------------
const TemplateFilename =
  'https://docs.google.com/spreadsheets/d/1fLAfbR_V6UAUuxwHSjOwlB5iiJzKkeR4k5U7-rPoOyI/export?format=xlsx';
// ----------------------------------------------------------------------

type SupplierProductsFileFormProps = {
  onSuccessCallback: (flag: boolean) => void;
};

const SupplierProductsFileForm: React.FC<SupplierProductsFileFormProps> = ({
  onSuccessCallback
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const [fileProducts, setFileProducts] = useState<any>('');
  const fileMap = {
    xlsxProductsData: fileProducts
  };

  const handleFileProductsUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileProducts(e.target.files[0]);
      // call formik onchange to validat
      productProps.onChange(e);
    }
  };

  const BatchSuppliersSchema = Yup.object().shape({
    xlsxProductsData: Yup.mixed().required(
      'No has cargado el archivo de Productos'
    )
  });

  const formik = useFormik({
    initialValues: {
      xlsxProductsData: ''
    },
    validationSchema: BatchSuppliersSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // redux
        await dispatch(
          setBatchSupplierProductFile(fileMap, sessionToken || '')
        );
        await delay(1000);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error) {
        console.error(error);
        let errmsg = 'Error cargando tus productos.';
        if (error instanceof AlimaAPITokenError) {
          errmsg = 'Error de conexión, recarga la página e intenta de nuevo!';
        }
        enqueueSnackbar(errmsg, {
          variant: 'error',
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          )
        });
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } =
    formik;
  const nonEmpty = values.xlsxProductsData !== '';
  const allValues = Object.keys(errors).length === 0;

  const productProps = getFieldProps('xlsxProductsData');

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography sx={{ color: 'text.secondary', mt: theme.spacing(1) }}>
            Para agregar tus productos, descarga el&nbsp;
            <Link
              to={TemplateFilename}
              component={RouterLink}
              download="Carga-de-Proveedores-Alima.xlsx"
              target="_blank"
              rel="noreferrer"
            >
              <b>template de carga de productos</b>
            </Link>
            , llena la información de cada producto. Luego, carga el archivo en
            el siguiente campo.
          </Typography>

          <TextField
            fullWidth
            type="file"
            label="Carga de Productos"
            {...getFieldProps('xlsxProductsData')}
            onChange={handleFileProductsUpload}
            error={Boolean(touched.xlsxProductsData && errors.xlsxProductsData)}
            helperText={touched.xlsxProductsData && errors.xlsxProductsData}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UploadFileIcon />
                </InputAdornment>
              ),
              componentsProps: {
                input: {
                  accept: '.xlsx'
                }
              }
            }}
          />

          <LoadingButton
            fullWidth
            disabled={!allValues || !nonEmpty}
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Cargar Productos
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default SupplierProductsFileForm;
