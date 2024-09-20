import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
// material
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import closeFill from '@iconify/icons-eva/close-fill';
import {
  Stack,
  TextField,
  IconButton,
  Alert,
  MenuItem,
  Grid,
  useTheme,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import {
  addUnit,
  editUnit,
  // editUnit,
  getUnitCategories,
  getUnits
} from '../../redux/slices/account';
// hooks
import useAuth from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../redux/store';
// components
import { estatesMx, zipCodes } from '../../domain/account/zipCodes';
import SearchInput from '../SearchInput';
import InvoiceSUnitForm from './InvoiceSUnitForm';
import BasicDialog from '../navigation/BasicDialog';
import DeliverySUnitForm from './DeliverySUnitForm';
// domain
import {
  DeliveryZones,
  UnitDeliveryInfoType,
  UnitInvoiceInfoType,
  UnitType
} from '../../domain/account/SUnit';
import { DeliveryTypes } from '../../domain/supplier/SupplierProduct';
// utils
import { delay } from '../../utils/helpers';
import { mixtrack } from '../../utils/analytics';
import { GQLError } from '../../errors';
import MultiSelect from '../MultiSelect';
import { paymentMethodType, paymentMethods } from '../../domain/orden/Orden';

// ----------------------------------------------------------------------

type SUnitFormProps = {
  onSuccessCallback: () => void;
  unitState?: UnitType & UnitInvoiceInfoType & UnitDeliveryInfoType;
  editMode?: boolean;
};

const SUnitForm: React.FC<SUnitFormProps> = ({
  onSuccessCallback,
  unitState = {
    unitCategory: '',
    unitName: '',
    street: '',
    externalNum: '',
    internalNum: '',
    neighborhood: '',
    city: '',
    estate: '',
    country: 'México',
    zipCode: '',
    // tax info
    taxId: '', // RFC in Mexico
    fiscalRegime: '',
    legalBusinessName: '',
    taxZipCode: '',
    certificateFile: undefined,
    secretsFile: undefined,
    passphrase: '',
    invoicePaymentMethod: '',
    invoicingTrigger: '',
    // delivery info
    deliveryTypes: [],
    deliveryZones: [],
    deliveryWindowSize: '',
    deliverySchedules: [],
    cutOffTime: 6, // 6pm
    warnDays: 1, // 1 day before
    paymentMethods: [] as paymentMethodType[],
    accountNumber: '',
  },
  editMode = false
}) => {
  const categFetched = useRef(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const { sessionToken } = useAuth();
  const [confirmedSave, setConfirmedSave] = useState(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { business, unitCategories } = useAppSelector((state) => state.account);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileCert, setFileCert] = useState<File | undefined>(
    unitState.certificateFile
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileSecrets, setFileSecrets] = useState<File | undefined>(
    unitState.secretsFile
  );
  const fileMap = {
    certificateFile: fileCert,
    secretsFile: fileSecrets
  };

  // hoook - fetch sunit categories
  useEffect(() => {
    if (unitCategories.length === 0 && !categFetched.current) {
      dispatch(getUnitCategories());
      categFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // zipcode handler
  const handleZip = (option: {
    label: string;
    value: string;
    estate?: string;
    city?: string;
  }) => {
    // update formik values
    setFieldValue('neighborhood', option.label);
    setFieldValue('estate', option.estate);
    setFieldValue('zipCode', option.value);
    if (option.city) {
      setFieldValue('city', option.city);
    }
  };

  // unitCateg handler
  const handleUnitCateg = (option: {
    label: string;
    value: string;
    estate?: string;
  }) => {
    // update formik values
    setFieldValue('unitCategory', option.value);
  };

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
    await delay(500);
    setOpenConfirmDiag(false);
  };

  const UnitSchema = Yup.object().shape({
    unitName: Yup.string()
      .min(2, '¡Nombre demasiado corto!')
      .max(50, '¡Nombre demasiado largo!')
      .required('Nombre del CEDIS es requerido.'),
    unitCategory: Yup.string()
      .oneOf(
        unitCategories.length > 0 ? unitCategories.map((v: any) => v.value) : []
      )
      .required('Tipo de Cocina es requerido.'),
    street: Yup.string()
      .min(3, '¡Calle demasiado corta!')
      .required('Calle es requerido.'),
    externalNum: Yup.string()
      .max(255, '¡Numero exterior demasiado largo, Máx. 255 caractéres!')
      .required('Número exterior es requerido.'),
    internalNum: Yup.string().max(
      255,
      '¡Numero interior demasiado largo, Máx. 255 caractéres!'
    ),
    neighborhood: Yup.string()
      .max(255, '¡Colonia es demasiado larga, Máx. 255 caractéres!')
      .required('Colonia es requerida.'),
    city: Yup.string()
      .max(255, 'Municipio/Alcaldía es demasiado largo, Máx. 255 caractéres!')
      .required('Municipio/Alcaldía es requerido.'),
    estate: Yup.string()
      .max(255, 'Estado es demasiado largo, Máx. 255 caractéres!')
      .required('Estado es requerido.'),
    country: Yup.string()
      .max(255, 'País es demasiado largo, Máx. 255 caractéres!')
      .required('País es requerido.'),
    zipCode: Yup.string()
      .length(5, '¡Código postal debe de ser a 5 dígitos')
      .matches(/\d*/)
      .required('Código postal es requerido.'),
    // additional invoice info
    taxId: Yup.string().max(14, 'RFC es inválido!'),
    fiscalRegime: Yup.string(),
    legalBusinessName: Yup.string().max(
      511,
      'Razón Social / Nombre es demasiado largo, Máx. 500 caractéres!'
    ),
    taxZipCode: Yup.string()
      .length(5, '¡Código postal debe de ser a 5 dígitos')
      .matches(/\d*/),
    // delivery info
    cutOffTime: Yup.number().required('Hora de Corte es requerida'),
    warnDays: Yup.number().min(1).max(10).required('Aviso previo es requerido'),
    deliveryWindowSize: Yup.number().required(
      'Ventana de Entrega es requerida'
    ),
    deliveryZones: Yup.array()
      .min(1, 'Al menos una zona de entrega es requerida')
      .of(Yup.string().oneOf(DeliveryZones.map((v) => v.zoneName)))
      .required('Al menos una zona de entrega es requerida'),
    deliveryTypes: Yup.array()
      .min(1, 'Al menos un tipo de entrega es requerido')
      .of(Yup.string().oneOf(Object.keys(DeliveryTypes)))
      .required('Al menos un tipo de entrega es requerido'),
    deliverySchedules: Yup.array()
      .min(1, 'Al menos un día de operación es requerido')
      .required('Al menos un día de operación es requerido'),
    certificateFile: Yup.mixed(),
    secretsFile: Yup.mixed(),
    accountNumber: Yup.string()
      .matches(/\d{18}/, 'CLABE debe de ser solo números (18 dígitos)')
      .length(18, 'CLABE debe de ser de 18 dígitos'),
    paymentMethods: Yup.array()
      .min(1, "Al menos un método de pago es requerido")
      .of(Yup.string().oneOf(Object.keys(paymentMethods)))
  });

  const formik = useFormik({
    initialValues: {
      ...unitState,
      certificateFile: undefined,
      secretsFile: undefined
    },
    validationSchema: UnitSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      // if the invoice info is not there and it has not been confirmed
      const isInvoiceInfoValid =
        values.taxId &&
        values.fiscalRegime &&
        values.legalBusinessName &&
        values.taxZipCode &&
        fileMap.certificateFile &&
        fileMap.secretsFile &&
        values.passphrase &&
        values.invoicePaymentMethod &&
        values.invoicingTrigger;
      if (!isInvoiceInfoValid && !confirmedSave) {
        setOpenConfirmDiag(true);
        setSubmitting(false);
        return;
      }
      try {
        if (
          values.paymentMethods &&
          values.paymentMethods.includes('transfer') &&
          values.accountNumber === ''
        ) {
          enqueueSnackbar(
            'Por favor ingresa tu CLABE para recibir transferencias para avanzar.',
            {
              variant: 'warning'
            }
          );
          setSubmitting(false);
          return;
        }
        const vdata: any = {
          ...values,
          deliveryZones: values.deliveryZones.map((z) => z.split(',')[0]),
          ...fileMap
        };
        // redux
        if (!editMode) {
          // Add
          await dispatch(addUnit(vdata, business, sessionToken || ''));
        } else {
          // Edit
          await dispatch(editUnit(vdata, sessionToken || ''));
        }
        // fetch all sunits
        await dispatch(getUnits(business, sessionToken || ''));
        setSubmitting(false);
        enqueueSnackbar(
          editMode ? 'CEDIS ha sido actualizado!' : 'CEDIS ha sido creado!',
          {
            variant: 'success',
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            )
          }
        );
        mixtrack('sunit', {
          unitName: values.unitName,
          unitCategory: values.unitCategory,
          zipCode: values.zipCode,
          invoicingInfo: isInvoiceInfoValid,
          transactionType: editMode ? 'update' : 'create',
          visit: window.location.toString(),
          page: 'SUnit',
          section: ''
        });
        // callback
        onSuccessCallback();
      } catch (error: any) {
        console.error(error);
        mixtrack('sunit_error', {
          unitName: values.unitName,
          unitCategory: values.unitCategory,
          zipCode: values.zipCode,
          invoicingInfo: isInvoiceInfoValid,
          transactionType: editMode ? 'update' : 'create',
          visit: window.location.toString(),
          page: 'SUnit',
          section: '',
          error: error.message
        });
        if (error instanceof GQLError) {
          if (error.reason === 'Supplier Unit') {
            enqueueSnackbar('Error creando tu CEDIS.', {
              variant: 'error',
              action: (key) => (
                <IconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </IconButton>
              )
            });
          } else {
            enqueueSnackbar(
              editMode ? 'CEDIS ha sido actualizado!' : 'CEDIS ha sido creado!',
              { variant: 'success' }
            );
            enqueueSnackbar(
              'Hubo un error cargando la información fiscal de tu CEDIS, revisa tu información',
              {
                variant: 'warning',
                action: (key) => (
                  <IconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </IconButton>
                )
              }
            );
            // callback - we still want to redirect to avoid double saving
            onSuccessCallback();
          }
        } else {
          enqueueSnackbar('Hubo un error creando tu CEDIS, intenta de nuevo.', {
            variant: 'error',
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            )
          });
        }
        setSubmitting(false);
      }
    }
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    setFieldValue
  } = formik;
  const isFull =
    values.unitCategory !== '' &&
    values.unitName !== '' &&
    values.street !== '' &&
    values.externalNum !== '' &&
    values.neighborhood !== '' &&
    values.city !== '' &&
    values.estate !== '' &&
    values.zipCode !== '';
  const areErrors =
    Object.keys(errors).filter((k) => k !== 'internalNum').length === 0;

  return (
    <>
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="¡Nos falta tu información de Facturación!"
        msg="Parece ser que no agregaste la información de facturación de tu CEDIS."
        continueAction={{
          active: true,
          msg: 'Guardar de todos modos',
          actionFn: () => handleConfirm(true)
        }}
        backAction={{
          active: true,
          msg: 'Regresar',
          actionFn: () => setOpenConfirmDiag(false)
        }}
        closeMark={false}
        onClose={() => handleConfirm(false)}
      >
        <Typography>
          <br />
          Agrega tus certificados e información fiscal para poder{' '}
          <b>automatizar tus facturas</b>.
          <br />
        </Typography>
      </BasicDialog>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <SearchInput
              fullWidth
              label="Categoría del Proveedor"
              options={unitCategories}
              onSelectOption={handleUnitCateg}
              defaultValue={
                editMode
                  ? unitCategories.find(
                    (b: any) => b.value === unitState.unitCategory
                  ) || undefined
                  : undefined
              }
              displayLabelFn={(
                option: { label: string; value: string } | string
              ) => (typeof option === 'string' ? option : option.label)}
              fieldProps={{
                error: Boolean(touched.unitCategory && errors.unitCategory),
                helperText: touched.unitCategory && errors.unitCategory
              }}
              searchOnLabel
              initialSize={100}
            />

            <TextField
              fullWidth
              label="Nombre del CEDIS"
              {...getFieldProps('unitName')}
              error={Boolean(touched.unitName && errors.unitName)}
              helperText={touched.unitName && errors.unitName}
            />

            <Grid container>
              <Grid item xs={8} lg={8} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  label="Calle"
                  {...getFieldProps('street')}
                  error={Boolean(touched.street && errors.street)}
                  helperText={touched.street && errors.street}
                />
              </Grid>
              <Grid item xs={4} lg={4}>
                <TextField
                  fullWidth
                  label="Núm. Ext."
                  {...getFieldProps('externalNum')}
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
                  {...getFieldProps('internalNum')}
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
                      ? zipCodes.find((z) => z.value === unitState.zipCode) ||
                      undefined
                      : undefined
                  }
                  fieldProps={{
                    error: Boolean(touched.zipCode && errors.zipCode),
                    helperText: touched.zipCode && errors.zipCode
                  }}
                  initialSize={20}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Colonia"
              {...getFieldProps('neighborhood')}
              error={Boolean(touched.neighborhood && errors.neighborhood)}
              helperText={touched.neighborhood && errors.neighborhood}
            />

            <TextField
              fullWidth
              label="Municipio o Alcaldía"
              {...getFieldProps('city')}
              error={Boolean(touched.city && errors.city)}
              helperText={touched.city && errors.city}
            />

            <Grid container>
              <Grid item xs={7} lg={7} sx={{ pr: theme.spacing(2) }}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  {...getFieldProps('estate')}
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
                  {...getFieldProps('country')}
                  error={Boolean(touched.country && errors.country)}
                  helperText={touched.country && errors.country}
                />
              </Grid>
            </Grid>

            {/* supplier unit delivery info */}
            <Box>
              <Divider />
              <Typography
                variant="subtitle1"
                color={'text.secondary'}
                sx={{ mt: theme.spacing(2), mb: theme.spacing(2) }}
              >
                Entregas
              </Typography>
              <DeliverySUnitForm
                theme={theme}
                getFieldProps={getFieldProps}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
                defaultValues={unitState}
                editMode={editMode}
              />
            </Box>
            {/* payment methods */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
                Escoge qué métodos de pago les darás as tus clientes.
              </Typography>
              <MultiSelect
                label="Métodos de Pago"
                {...getFieldProps('paymentMethods')}
                options={Object.entries(paymentMethods).map((v) => ({
                  key: v[0],
                  value: v[1]
                }))}
                onChange={(e: any) => {
                  formik.setFieldValue('paymentMethods', e.target.value);
                }}
              />
              {values.paymentMethods?.includes(
                'transfer' as paymentMethodType
              ) && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Escribe la Cuenta CLABE a la que tus clientes podrán hacer
                      transferencias.
                    </Typography>
                    <TextField
                      fullWidth
                      label="CLABE"
                      {...getFieldProps('accountNumber')}
                      error={Boolean(
                        touched.accountNumber && errors.accountNumber
                      )}
                      helperText={touched.accountNumber && errors.accountNumber}
                    />
                  </Box>
                )}
            </Box>

            {/* Supplier Unit Tax Info */}
            <Box>
              <Divider />
              <Typography
                variant="subtitle1"
                color={'text.secondary'}
                sx={{ mt: theme.spacing(3) }}
              >
                Facturación
              </Typography>
              <InvoiceSUnitForm
                theme={theme}
                getFieldProps={getFieldProps}
                setFieldValue={setFieldValue}
                setFileCert={setFileCert}
                setFileSecrets={setFileSecrets}
                touched={touched}
                errors={errors}
                defaultValues={unitState}
                editMode={editMode}
              />
            </Box>

            {!areErrors && isFull && (
              <Alert severity="error">
                {errors.unitName ||
                  errors.externalNum ||
                  errors.neighborhood ||
                  errors.city ||
                  errors.estate ||
                  errors.zipCode ||
                  errors.country ||
                  (typeof errors.paymentMethods === 'string'
                    ? errors.paymentMethods
                    : 'Es requerido al menos un método de pago') ||
                  (typeof errors.deliverySchedules === 'string'
                    ? errors.deliverySchedules
                    : 'Días de operación son requeridos') ||
                  (typeof errors.deliveryZones === 'string'
                    ? errors.deliveryZones
                    : 'Zonas de entrega son requeridos') ||
                  (typeof errors.deliveryTypes === 'string'
                    ? errors.deliveryTypes
                    : 'Tipos de entrega son requeridos')}
              </Alert>
            )}

            <LoadingButton
              fullWidth
              disabled={!areErrors}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {editMode ? 'Editar CEDIS' : 'Crear CEDIS'}
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </>
  );
};

export default SUnitForm;
