import * as Yup from "yup";
import { useState } from "react";
// material
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
import {
  Stack,
  TextField,
  IconButton,
  Alert,
  Typography,
  Grid,
  MenuItem,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// redux
import { addClient, editClient } from "../../redux/slices/client";
// hooks
import useAuth from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
// components
import SearchInput from "../SearchInput";
// domain
import {
  ClientBranchType,
  ClientPOCType,
  ClientInvoiceInfoType,
} from "../../domain/client/Client";
import { estatesMx, zipCodes } from "../../domain/account/zipCodes";
import track from "../../utils/analytics";
import BasicDialog from "../navigation/BasicDialog";
import InvoicClientForm from "../account/InvoiceClientForm";
import { KeyValueOption, MultiKeyValueInput } from "../MultiKeyValueInput";

// ----------------------------------------------------------------------

type ClientFormProps = {
  onSuccessCallback: (() => void) | ((flag: boolean) => void);
  clientState?: ClientBranchType & ClientPOCType & ClientInvoiceInfoType;
  editMode?: boolean;
};

const ClientForm: React.FC<ClientFormProps> = ({
  onSuccessCallback,
  clientState = {
    branchName: "",
    // clientCategory: '',
    street: "",
    externalNum: "",
    internalNum: "",
    neighborhood: "",
    city: "",
    estate: "",
    country: "México",
    zipCode: "",
    displayName: "",
    email: "",
    phoneNumber: "",
    taxId: "", // RFC in Mexico
    fiscalRegime: "",
    taxName: "",
    taxAddress: "",
    cfdiUse: "",
    taxZipCode: "",
    invoiceEmail: "",
    invoicePaymentMethod: undefined,
    invoicingTrigger: undefined,
    tags: [],
  },
  editMode = false,
}) => {
  const theme = useTheme();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const { sessionToken } = useAuth();
  const [confirmedSave, setConfirmedSave] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  // const { clientCategories } = useAppSelector((state) => state.client);
  const { activeUnit } = useAppSelector((state) => state.account);
  const [selectedTags, setSelectedTags] = useState<KeyValueOption[]>(
    (clientState.tags || []).map((t) => ({
      key: t.tagKey,
      value: t.tagValue,
    }))
  );

  // // hoook - fetch branch categories
  // useEffect(() => {
  //   if (clientCategories.length === 0) {
  //     dispatch(getClientCategories());
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch]);

  // client categ handler
  // const handleClientCateg = (option: {
  //   label: string;
  //   value: string;
  //   estate?: string;
  // }) => {
  //   // update formik values
  //   setFieldValue('clientCategory', option.value);
  // };

  // add tag handler
  const handleAddTag = (option: KeyValueOption) => {
    const _tags = [...selectedTags, option];
    setSelectedTags(_tags);
    setFieldValue(
      "tags",
      _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
    );
  };

  // delete tag handler
  const handleDeleteTag = (option: KeyValueOption) => {
    const _tags = [...selectedTags].filter((t) => t.key !== option.key);
    setSelectedTags(_tags);
    setFieldValue(
      "tags",
      _tags.map((t) => ({ tagKey: t.key, tagValue: t.value }))
    );
  };

  // zipcode handler
  const handleZip = (option: {
    label: string;
    value: string;
    estate?: string;
    city?: string;
  }) => {
    // update formik values
    setFieldValue("neighborhood", option.label);
    setFieldValue("estate", option.estate);
    setFieldValue("zipCode", option.value);
    if (option.city) {
      setFieldValue("city", option.city);
    }
  };

  const ClientSchema = Yup.object().shape({
    branchName: Yup.string()
      .min(2, "¡Nombre demasiado corto!")
      .max(255, "¡Nombre demasiado largo!")
      .required("Nombre del Cliente es requerido."),
    // clientCategory: Yup.string()
    //   .oneOf(
    //     clientCategories.length > 0
    //       ? clientCategories.map((v: any) => v.value)
    //       : []
    //   )
    //   .required('Categoría del Cliente es requerido.'),
    street: Yup.string()
      .min(3, "¡Calle demasiado corta!")
      .required("Calle es requerido."),
    externalNum: Yup.string()
      .max(255, "¡Numero exterior demasiado largo, Máx. 255 caractéres!")
      .required("Número exterior es requerido."),
    internalNum: Yup.string().max(
      255,
      "¡Numero interior demasiado largo, Máx. 255 caractéres!"
    ),
    // neighborhood: Yup.string()
    //   .max(255, '¡Colonia es demasiado larga, Máx. 255 caractéres!')
    //   .required('Colonia es requerida.'),
    // city: Yup.string()
    //   .max(255, 'Municipio/Alcaldía es demasiado largo, Máx. 255 caractéres!')
    //   .required('Municipio/Alcaldía es requerido.'),
    // estate: Yup.string()
    //   .max(255, 'Estado es demasiado largo, Máx. 255 caractéres!')
    //   .required('Estado es requerido.'),
    // country: Yup.string()
    //   .max(255, 'País es demasiado largo, Máx. 255 caractéres!')
    //   .required('País es requerido.'),
    // zipCode: Yup.string()
    //   .length(5, '¡Código postal debe de ser a 5 dígitos')
    //   .matches(/\d*/)
    //   .required('Código postal es requerido.'),
    // additional invoice info
    displayName: Yup.string()
      .min(2, "¡Nombre del Contacto demasiado corto!")
      .max(255, "¡Nombre del Contacto demasiado largo!")
      .required("Nombre del Contacto del Cliente es requerido."),
    phoneNumber: Yup.string()
      .length(10, "¡Teléfono debe de ser a 10 dígitos")
      .matches(/\d*/)
      .required("Teléfono es requerido."),
    email: Yup.string().email("Email inválido").required("Email es requerido."),
    // additional invoice info
    taxId: Yup.string().max(14, "RFC es inválido!"),
    fiscalRegime: Yup.string(),
    taxName: Yup.string().max(
      511,
      "Razón Social / Nombre es demasiado largo, Máx. 500 caractéres!"
    ),
    taxAddress: Yup.string().max(
      511,
      "Dirección Fiscal es demasiado larga, Máx. 500 caractéres!"
    ),
    cfdiUse: Yup.string(),
    taxZipCode: Yup.string()
      .length(5, "¡Código postal debe de ser a 5 dígitos")
      .matches(/\d*/),
    invoiceEmail: Yup.string().email("Email inválido"),
    tags: Yup.array(Yup.mixed()),
  });

  const formik = useFormik({
    initialValues: clientState,
    validationSchema: ClientSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        if (!activeUnit?.id) {
          enqueueSnackbar(
            "No tienes una CEDIS activo. Por favor crea uno antes de agregar al cliente.",
            {
              variant: "warning",
              autoHideDuration: 5000,
            }
          );
          setSubmitting(false);
          return;
        }
        if (
          !values.zipCode ||
          !values.neighborhood ||
          !values.city ||
          !values.estate
        ) {
          const validationValue = !values.zipCode
            ? "el Código Postal"
            : !values.neighborhood
            ? "la Colonia"
            : !values.city
            ? "el Municipio/Alcaldía"
            : "el Estado";
          enqueueSnackbar(`Ingresa ${validationValue}.`, {
            variant: "warning",
            autoHideDuration: 5000,
          });
          setSubmitting(false);
          return;
        }
        const isInvoiceInfoValid =
          values.taxId !== "" &&
          values.fiscalRegime !== "" &&
          values.taxName !== "" &&
          values.taxAddress !== "" &&
          values.cfdiUse !== "" &&
          values.taxZipCode !== "" &&
          values.invoiceEmail !== "" &&
          values.invoicePaymentMethod &&
          values.invoicingTrigger;
        if (!isInvoiceInfoValid && !confirmedSave) {
          setOpenConfirmDiag(true);
          setSubmitting(false);
          return;
        }
        // redux
        if (!editMode) {
          // add
          await dispatch(
            addClient(
              {
                ...values,
              },
              activeUnit.id,
              sessionToken || ""
            )
          );
        } else {
          // update
          await dispatch(
            editClient(
              {
                ...values,
              },
              activeUnit.id,
              sessionToken || ""
            )
          );
        }
        // action
        setSubmitting(false);
        // callback - check if invoice info is valid. If so Callback is false.
        onSuccessCallback(true);
        track("set_checkout_option", {
          visit: window.location.toString(),
          page: "AddClient",
          section: "ClientForm",
          operation: editMode ? "edit" : "add",
          method: "onSubmit",
        });
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(
          `Error ${
            editMode ? "actualizando" : "creando"
          } cliente. Por favor intenta de nuevo.`,
          {
            variant: "error",
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            ),
          }
        );
        setSubmitting(false);
        track("exception", {
          visit: window.location.toString(),
          page: "AddClient",
          section: "ClientForm",
          method: "onSubmit",
          error: error.toString(),
        });
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    setFieldValue,
  } = formik;
  const isFormFull =
    values.branchName !== "" &&
    values.clientCategory !== "" &&
    values.street !== "" &&
    values.externalNum !== "" &&
    // values.neighborhood !== '' &&
    // values.city !== '' &&
    // values.estate !== '' &&
    // values.zipCode !== '' &&
    values.phoneNumber !== "" &&
    values.email !== "" &&
    values.displayName !== "";
  const hasErrors = !(Object.keys(errors).length === 0);

  const handleConfirm = (validationReminder: boolean) => {
    if (validationReminder) {
      setOpenConfirmDiag(false);
      setConfirmedSave(true);
      handleSubmit();
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    setOpenConfirmDiag(false);
  };

  return (
    <>
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="¡Nos falta la información de Facturación!"
        msg="Parece ser que no agregaste la información de facturación del cliente."
        continueAction={{
          active: true,
          msg: "Guardar de todos modos",
          actionFn: () => handleConfirm(true),
        }}
        backAction={{
          active: true,
          msg: "Regresar",
          actionFn: () => setOpenConfirmDiag(false),
        }}
        closeMark={false}
        onClose={() => handleConfirm(false)}
      >
        <Typography>
          <br />
          Sino la agregas no sé podrán realizar las{" "}
          <b>facturas en automático</b>.
          <br />
        </Typography>
      </BasicDialog>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {hasErrors && isFormFull && (
              <Alert severity="error">
                {
                  errors.branchName ||
                    errors.clientCategory ||
                    errors.country ||
                    errors.email ||
                    errors.phoneNumber ||
                    errors.displayName ||
                    errors.street ||
                    errors.externalNum ||
                    errors.internalNum
                  // errors.neighborhood ||
                  // errors.city ||
                  // errors.estate ||
                  // errors.zipCode
                }
              </Alert>
            )}

            {/* <SearchInput
              fullWidth
              label="Categoría del Cliente"
              options={clientCategories}
              onSelectOption={handleClientCateg}
              defaultValue={
                editMode
                  ? clientCategories.find(
                      (b: any) => b.value === clientState.clientCategory
                    ) || undefined
                  : undefined
              }
              displayLabelFn={(
                option: { label: string; value: string } | string
              ) => (typeof option === 'string' ? option : option.label)}
              fieldProps={{
                error: Boolean(touched.clientCategory && errors.clientCategory),
                helperText: touched.clientCategory && errors.clientCategory
              }}
              searchOnLabel
            /> */}

            <TextField
              fullWidth
              label="Nombre del Cliente"
              {...getFieldProps("branchName")}
              error={Boolean(touched.branchName && errors.branchName)}
              helperText={touched.branchName && errors.branchName}
            />

            <TextField
              fullWidth
              label="Nombre del Contacto del Cliente"
              {...getFieldProps("displayName")}
              error={Boolean(touched.displayName && errors.displayName)}
              helperText={touched.displayName && errors.displayName}
            />

            <TextField
              fullWidth
              type="email"
              label="Correo Electrónico"
              {...getFieldProps("email")}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />

            <TextField
              fullWidth
              label="Teléfono"
              {...getFieldProps("phoneNumber")}
              error={Boolean(touched.phoneNumber && errors.phoneNumber)}
              helperText={touched.phoneNumber && errors.phoneNumber}
              InputProps={{
                startAdornment: <Typography>+52&nbsp;</Typography>,
              }}
            />

            <Grid container>
              <Grid item xs={8} lg={8} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  label="Calle"
                  {...getFieldProps("street")}
                  error={Boolean(touched.street && errors.street)}
                  helperText={touched.street && errors.street}
                />
              </Grid>
              <Grid item xs={4} lg={4}>
                <TextField
                  fullWidth
                  label="Núm. Ext."
                  {...getFieldProps("externalNum")}
                  error={Boolean(touched.externalNum && errors.externalNum)}
                  helperText={touched.externalNum && errors.externalNum}
                />
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={4} lg={4} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  label="Núm. Int."
                  {...getFieldProps("internalNum")}
                  error={Boolean(touched.internalNum && errors.internalNum)}
                  helperText={touched.internalNum && errors.internalNum}
                />
              </Grid>
              <Grid item xs={8} lg={8}>
                <SearchInput
                  fullWidth
                  label="Código Postal"
                  options={zipCodes}
                  onSelectOption={handleZip}
                  defaultValue={
                    editMode
                      ? zipCodes.find((z) => z.value === clientState.zipCode) ||
                        undefined
                      : undefined
                  }
                  fieldProps={{
                    error: Boolean(touched.zipCode && errors.zipCode),
                    helperText: touched.zipCode && errors.zipCode,
                  }}
                  initialSize={20}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Colonia"
              {...getFieldProps("neighborhood")}
              error={Boolean(touched.neighborhood && errors.neighborhood)}
              helperText={touched.neighborhood && errors.neighborhood}
            />

            <TextField
              fullWidth
              label="Municipio o Alcaldía"
              {...getFieldProps("city")}
              error={Boolean(touched.city && errors.city)}
              helperText={touched.city && errors.city}
            />

            <Grid container>
              <Grid item xs={7} lg={7} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  {...getFieldProps("estate")}
                  error={Boolean(touched.estate && errors.estate)}
                  helperText={touched.estate && errors.estate}
                >
                  {Object.values(estatesMx).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={5} lg={5}>
                <TextField
                  fullWidth
                  disabled
                  label="País"
                  {...getFieldProps("country")}
                  error={Boolean(touched.country && errors.country)}
                  helperText={touched.country && errors.country}
                />
              </Grid>
            </Grid>

            <Grid>
              <Typography
                variant="h6"
                sx={{ pt: 2, pb: 1, px: 1 }}
                color="text.secondary"
              >
                Etiquetas (Opcional)
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>
                Las etiquetas son palabras clave para identificar tus clientes.
              </Typography>

              <MultiKeyValueInput
                selectedOptions={selectedTags}
                onAdd={handleAddTag}
                onRemove={handleDeleteTag}
              />
            </Grid>

            {/* Client Tax Info */}
            <Typography
              variant="subtitle1"
              color={"text.secondary"}
              sx={{ mt: theme.spacing(3) }}
            >
              Datos Fiscales
            </Typography>
            <InvoicClientForm
              theme={theme}
              getFieldProps={getFieldProps}
              setFieldValue={setFieldValue}
              touched={touched}
              errors={errors}
              defaultValues={clientState}
              editMode={editMode}
            />

            <LoadingButton
              fullWidth
              disabled={hasErrors || !isFormFull}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {editMode ? "Editar Cliente" : "Agregar Cliente"}
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </>
  );
};

export default ClientForm;
