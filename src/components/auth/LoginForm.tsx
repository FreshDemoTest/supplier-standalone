import * as Yup from "yup";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { Link as RouterLink } from "react-router-dom";
import { useFormik, Form, FormikProvider } from "formik";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// material
import {
  Link,
  Stack,
  Alert,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Icon } from "@iconify/react";
import eyeFill from "@iconify/icons-eva/eye-fill";
import closeFill from "@iconify/icons-eva/close-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
// routes
import { PATH_AUTH } from "../../routes/paths";
// hooks
import useAuth from "../../hooks/useAuth";
// utils
import track from "../../utils/analytics";

// ----------------------------------------------------------------------
interface FirebaseAuthError extends firebase.auth.Error {}

const firebaseErrors: any = {
  "auth/user-not-found": "Usuario parece no estar registrado.",
  "auth/wrong-password": "Contraseña incorrecta",
};

export default function LoginForm() {
  const { login } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Usuario tiene que ser un email válido")
      .required("Usuario es requerido"),
    password: Yup.string().required("Contraseña es requerida"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
      try {
        await login(values.email, values.password);
        track("login", {
          email: values.email,
          remember: values.remember,
          visit: window.location.toString(),
          page: "Login",
          section: "",
        });
        enqueueSnackbar("Acceso correcto", {
          variant: "success",
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        });
        setSubmitting(false);
      } catch (error: any) {
        console.error(error);
        resetForm();
        setSubmitting(false);
        if ((error as FirebaseAuthError).code in firebaseErrors) {
          // setErrors({ afterSubmit: firebaseErrors[error.code] });
          const fErr = firebaseErrors[(error as FirebaseAuthError).code];
          setErrors({ email: fErr });
        } else {
          setErrors({ email: (error as FirebaseAuthError).message });
        }
        track("exception", {
          email: values.email,
          visit: window.location.toString(),
          page: "Login",
          section: "",
          error: error.toString(),
        });
      }
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } =
    formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.email && <Alert severity="error">{errors.email}</Alert>}

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Correo electrónico"
            {...getFieldProps("email")}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            {...getFieldProps("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                {...getFieldProps("remember")}
                checked={values.remember}
              />
            }
            label="Recuérdame"
          />
          <Link
            component={RouterLink}
            variant="subtitle2"
            to={PATH_AUTH.resetPassword}
            onClick={() => {
              track("exception", {
                email: values.email,
                visit: window.location.toString(),
                page: "Login",
                section: "",
              });
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Iniciar Sesión
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
