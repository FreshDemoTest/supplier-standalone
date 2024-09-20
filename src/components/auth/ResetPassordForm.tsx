import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { TextField, Alert, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useAuth from '../../hooks/useAuth';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import { enqueueSnackbar } from 'notistack';
// hooks

// ----------------------------------------------------------------------

type ResetPasswordFormProps = {
  onSent: () => void;
  onGetEmail: (email: string) => void;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSent,
  onGetEmail
}) => {
  const { resetPassword } = useAuth();
  const isMountedRef = useIsMountedRef();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Correo electrónico es inválido.')
      .required('Correo electrónico es requerido.')
  });

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        await resetPassword(values.email);
        if (isMountedRef.current) {
          setSubmitting(false);
        }
        onSent();
        onGetEmail(formik.values.email);
        enqueueSnackbar('¡Correo enviado!', {
          variant: 'success'
        });
      } catch (error: any) {
        console.error(error);
        if (isMountedRef.current) {
          setErrors({ email: error.message });
          setSubmitting(false);
        }
        enqueueSnackbar(
          '¡Ocurrió un error enviando el correo, intenta de nuevo!',
          {
            variant: 'error'
          }
        );
      }
    }
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.email && <Alert severity="error">{errors.email}</Alert>}

          <TextField
            fullWidth
            {...getFieldProps('email')}
            type="email"
            label="Correo electrónico"
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Resetear Contraseña
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default ResetPasswordForm;
