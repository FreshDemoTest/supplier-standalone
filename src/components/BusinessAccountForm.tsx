import * as Yup from "yup";
import { useEffect, useRef } from "react";
// import { useState } from 'react';
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
// material
import {
  Stack,
  TextField,
  IconButton,
  Alert,
  Typography,
  MenuItem,
  Box,
  Grid,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// hooks
import useAuth from "../hooks/useAuth";
// redux
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  setBusinessAccount,
  updateBusinessAccount,
} from "../redux/slices/account";
import { SupplierBusinessImageSelector } from "./supplier/images/SupplierBusinessImageSelector";
import { getUser } from "../redux/slices/registration";
// domain
import {
  BusinessType,
  businessTypes,
  minOrdenUnits,
} from "../domain/account/Business";
import track from "../utils/analytics";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const businessKeys = businessTypes.map((v) => v.value);
const webRe =
  /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;

// ----------------------------------------------------------------------
type BusinessAccountFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  businessState?: BusinessType;
  editMode?: boolean;
};

const BusinessAccountForm: React.FC<BusinessAccountFormProps> = ({
  onSuccessCallback,
  businessState = {
    id: "",
    businessName: "",
    businessType: "",
    email: "",
    phoneNumber: "",
    website: "",
    minQuantity: undefined,
    minQuantityUnit: undefined,
    // paymentMethods: [] as paymentMethodType[],
    // accountNumber: '',
    policyTerms: "",
  },
  editMode = false,
}) => {
  const fetchedUser = useRef(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { getSessionToken, sessionToken, logout } = useAuth();
  const { user: myUser } = useAppSelector((state) => state.registration);
  const dispatch = useAppDispatch();

  // hook - get session token
  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [getSessionToken, sessionToken]);

  // hook - get User info
  useEffect(() => {
    const _getUser = async () => {
      if (!sessionToken || fetchedUser.current) return;
      try {
        fetchedUser.current = true;
        await dispatch(getUser(sessionToken));
      } catch (error) {
        // [TODO] - here instead of logging out, we should redirect to a page of different onboarding
        console.error(error);
        enqueueSnackbar(
          `Error: tu usuario Alima Seller no está registrado. Por favor contacta a soporte.`,
          {
            variant: "error",
            autoHideDuration: 4000,
          }
        );
        await logout();
      }
    };
    if (!myUser || !myUser.id) {
      _getUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  const OnboardingSchema = Yup.object().shape({
    businessName: Yup.string()
      .min(2, "¡Nombre demasiado corto!")
      .max(50, "¡Nombre demasiado largo!")
      .required("Nombre del Negocio es requerido."),
    businessType: Yup.string()
      .oneOf(businessKeys)
      .required("Tipo de Negocio es requerido."),
    email: Yup.string()
      .email("¡Correo eléctronico inválido!")
      .required("Correo electrónico es requerido."),
    phoneNumber: Yup.string()
      .length(10, "¡Teléfono debe de ser a 10 dígitos")
      .matches(/\d*/)
      .required("Teléfono es requerido."),
    website: Yup.string().matches(
      webRe,
      "URL de página web inválido. Debe ser www.ejemplo.com"
    ),
    minQuantity: Yup.number().required("Mínimo de Pedido es requerida."),
    minQuantityUnit: Yup.string()
      .oneOf(Object.keys(minOrdenUnits))
      .required("Unidad es requerida."),
  });

  const formik = useFormik({
    initialValues: businessState,
    validationSchema: OnboardingSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // format data
        const validValues: any = { ...values };

        // redux
        if (!editMode) {
          // add business info
          await dispatch(setBusinessAccount(validValues, sessionToken || ""));
        } else {
          // edit business info
          await dispatch(
            updateBusinessAccount(validValues, sessionToken || "")
          );
        }
        // callback
        track("sign_up", {
          businessName: values.businessName,
          businessType: values.businessType,
          email: values.email,
          phoneNumber: values.phoneNumber,
          website: values.website,
          transactionType: editMode ? "update" : "create",
          visit: window.location.toString(),
          page: "BusinessAccount",
          section: "",
        });
        // success message
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(
          `Error ${
            editMode ? "actualizando" : "creando"
          } tu cuenta. Por favor contacta a soporte.`,
          {
            variant: "error",
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            ),
          }
        );
        track("exception", {
          error: error.toString(),
          transactionType: editMode ? "update" : "create",
          visit: window.location.toString(),
          page: "BusinessAccount",
          section: "",
        });
        setSubmitting(false);
        if (editMode) {
          onSuccessCallback(false);
        }
      }
    },
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } =
    formik;
  const fieldsFull =
    values.businessName !== "" &&
    values.businessType !== "" &&
    values.email !== "" &&
    values.phoneNumber !== "" &&
    values.policyTerms !== "";
  const hasErrors =
    Object.keys(errors).filter((k) => !["website", "accountNumber"].includes(k))
      .length === 0;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {!hasErrors && fieldsFull && (
            <Alert severity="error">
              {errors.businessName ||
                errors.businessType ||
                errors.phoneNumber ||
                errors.email ||
                errors.website}
            </Alert>
          )}

          <TextField
            fullWidth
            select
            label="Tipo de Negocio"
            {...getFieldProps("businessType")}
            error={Boolean(touched.businessType && errors.businessType)}
            helperText={touched.businessType && errors.businessType}
          >
            {businessTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Nombre del Negocio"
            {...getFieldProps("businessName")}
            error={Boolean(touched.businessName && errors.businessName)}
            helperText={touched.businessName && errors.businessName}
          />

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Correo electrónico del Negocio"
            {...getFieldProps("email")}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="phone"
            type="number"
            label="Teléfono del Negocio"
            {...getFieldProps("phoneNumber")}
            error={Boolean(touched.phoneNumber && errors.phoneNumber)}
            helperText={touched.phoneNumber && errors.phoneNumber}
            InputProps={{
              startAdornment: <Typography>+52&nbsp;</Typography>,
            }}
          />

          <TextField
            fullWidth
            type="url"
            label="Página Web del Negocio (opcional)"
            {...getFieldProps("website")}
            error={Boolean(touched.website && errors.website)}
            helperText={touched.website && errors.website}
          />

          {/* Commercial conditions */}
          <Stack spacing={2}>
            {/* min order */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {" "}
                Condiciones Comerciales
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Agrega las condiciones comerciales que quieres mostrar por
                defecto a los clientes que visiten tu perfil. Tu podrías después
                asignar diferentes condiciones comerciales específicas a cada
                cliente.
                <br /> <br />
                Empieza definiendo el valor de tu pedido mínimo en pesos (MXN) o
                en número de productos.
              </Typography>
              <Grid container>
                <Grid item xs={8} md={8} sx={{ pr: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Mínimo de Pedido"
                    {...getFieldProps("minQuantity")}
                    error={Boolean(touched.minQuantity && errors.minQuantity)}
                    helperText={touched.minQuantity && errors.minQuantity}
                  />
                </Grid>
                <Grid item xs={4} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Unidad"
                    {...getFieldProps("minQuantityUnit")}
                    error={Boolean(
                      touched.minQuantityUnit && errors.minQuantityUnit
                    )}
                    helperText={
                      touched.minQuantityUnit && errors.minQuantityUnit
                    }
                  >
                    {Object.entries(minOrdenUnits).map((option) => (
                      <MenuItem key={option[0]} value={option[0]}>
                        {option[1]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* policy terms */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Describe tus políticas de venta, entregas y devoluciones.
              </Typography>
              <TextField
                label="Políticas de Venta, Entrega y Devoluciones"
                placeholder='Ejemplo: "No se aceptan devoluciones."'
                {...getFieldProps("policyTerms")}
                error={Boolean(touched.policyTerms && errors.policyTerms)}
                helperText={touched.policyTerms && errors.policyTerms}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Stack>
          {editMode ? (
            <>
              <Typography
                variant="h6"
                sx={{ mt: { xs: 1, md: -3 }, px: 1, pb: 1 }}
                color="text.secondary"
              >
                Logo
              </Typography>
              <SupplierBusinessImageSelector
                supplierBusinessId={businessState.id || ""}
              />
            </>
          ) : null}

          <LoadingButton
            fullWidth
            disabled={!hasErrors || !fieldsFull}
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {editMode ? "Actualizar información" : "Crear Cuenta"}
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default BusinessAccountForm;
