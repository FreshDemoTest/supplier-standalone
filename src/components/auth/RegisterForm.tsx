import * as Yup from 'yup';
import mixpanel from 'mixpanel-browser';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import eyeFill from '@iconify/icons-eva/eye-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// material
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../hooks/useAuth';
import { useAppDispatch } from '../../redux/store';
import {
  raiseError,
  setUser,
  startLoading
} from '../../redux/slices/registration';
// domain
import { UserType } from '../../domain/account/User';
// utils
import { mixtrack } from '../../utils/analytics';
//

// ----------------------------------------------------------------------
interface FirebaseAuthError extends firebase.auth.Error {}

const firebaseErrors: any = {
  'auth/email-already-in-use':
    'Éste email ya está registrado. Puedes ir a iniciar sesión.'
};

type RegisterFormProps = {
  userState?: UserType & { password?: string };
  editMode?: boolean;
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  userState = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  },
  editMode = false
}) => {
  const { register } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  // const { startLoading, deleteUser, finishProcess } = useAppSelector(state => state.registration);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, '¡Nombre demasiado corto!')
      .max(50, '¡Nombre demasiado largo!')
      .required('Nombre es requerido.'),
    lastName: Yup.string()
      .min(2, '¡Apellido demasiado corto!')
      .max(50, '¡Apellido demasiado largo!')
      .required('Apellido es requerido.'),
    email: Yup.string()
      .email('¡Correo eléctronico inválido!')
      .required('Correo electrónico es requerido.'),
    phoneNumber: Yup.string()
      .length(10, '¡Teléfono debe de ser a 10 dígitos')
      .matches(/\d*/)
      .required('Teléfono es requerido.'),
    password: Yup.string()
      .min(8, '¡Contraseña debe ser de al menos 8 caractéres!')
      .required('Contraseña es requerida.')
  });

  const formik = useFormik({
    initialValues: userState,
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      let steps = {
        firebase: false,
        backend: false
      };
      try {
        // redux
        if (!editMode) {
          // new user
          dispatch(startLoading());
          // firebase
          await register(
            values.email,
            values.password || '',
            values.firstName,
            values.lastName
          );
          steps.firebase = true;
          const fbuser = firebase.auth().currentUser;
          // backend
          // [TODO] Posible error
          dispatch(
            setUser({
              ...values,
              firebaseId: fbuser?.uid || ''
            })
          );
          steps.backend = true;
          // mixpanel identify user
          mixpanel.identify(fbuser?.uid);
          mixtrack('sign_up', {
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber,
            firebaseId: fbuser?.uid,
            distinctId: fbuser?.uid,
            transactionType: editMode ? 'update' : 'create',
            visit: window.location.toString(),
            page: 'Register',
            section: ''
          });
          // message
          enqueueSnackbar('Registro exitoso', {
            variant: 'success',
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            )
          });
        } else {
          // edit user
          dispatch(startLoading());
          // dispatch(updateUserProfile(values));
          // firebase - [TODO]
          // backend - [TODO]
        }
        setSubmitting(false);
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar('Error en registro', {
          variant: 'error',
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          )
        });
        if (steps.firebase && !steps.backend) {
          // firebase - delete user if failed to create backend user
          await firebase.auth().currentUser?.delete();
        }
        setSubmitting(false);
        if ((error as FirebaseAuthError).code in firebaseErrors) {
          // setErrors({ afterSubmit: firebaseErrors[error.code] });
          const fErr = firebaseErrors[(error as FirebaseAuthError).code];
          setErrors({ email: fErr });
        } else {
          setErrors({ email: (error as FirebaseAuthError).message });
        }
        // redux
        dispatch(raiseError(error));
        // track error
        mixtrack('error', {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          visit: window.location.toString(),
          page: 'Register',
          section: '',
          error: error.toString()
        });
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } =
    formik;
  const nonEmpty =
    values.firstName !== '' &&
    values.lastName !== '' &&
    values.email !== '' &&
    values.phoneNumber !== '' &&
    values.password !== '';
  const allValues = Object.keys(errors).length === 0;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {!allValues && nonEmpty && (
            <Alert severity="error">
              {errors.firstName ||
                errors.lastName ||
                errors.phoneNumber ||
                errors.email ||
                errors.password}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              disabled={editMode}
              label="Nombre"
              {...getFieldProps('firstName')}
              error={Boolean(touched.firstName && errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />

            <TextField
              fullWidth
              disabled={editMode}
              label="Apellido(s)"
              {...getFieldProps('lastName')}
              error={Boolean(touched.lastName && errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />
          </Stack>

          <TextField
            fullWidth
            autoComplete="phone"
            type="number"
            label="Teléfono"
            disabled={editMode}
            {...getFieldProps('phoneNumber')}
            error={Boolean(touched.phoneNumber && errors.phoneNumber)}
            helperText={touched.phoneNumber && errors.phoneNumber}
            InputProps={{
              startAdornment: <Typography>+52&nbsp;</Typography>
            }}
          />

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Correo electrónico"
            disabled={editMode}
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          {!editMode && (
            <TextField
              fullWidth
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              {...getFieldProps('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => {
                        mixtrack('show_password', {
                          visit: window.location.toString(),
                          page: 'Register',
                          section: '',
                          showPassword: showPassword
                        });
                        setShowPassword((prev) => !prev);
                      }}
                    >
                      <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
            />
          )}

          {/* [TODO] - implement edit mode */}
          {!editMode && (
            <LoadingButton
              fullWidth
              disabled={!allValues}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {editMode ? 'Actualizar perfil' : 'Registrarme'}
            </LoadingButton>
          )}
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default RegisterForm;
