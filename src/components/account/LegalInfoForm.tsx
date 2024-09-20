import * as Yup from 'yup';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
// material
import { Icon } from '@iconify/react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import closeFill from '@iconify/icons-eva/close-fill';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Link,
  useTheme,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { setLegalBusiness } from '../../redux/slices/account';
// hooks
import useIsMountedRef from '../../hooks/useIsMountedRef';
import { useAppDispatch, useAppSelector } from '../../redux/store';
// domain
import { LegalBusinessType } from '../../domain/account/Business';
import useAuth from '../../hooks/useAuth';
import { createBlobURI } from '../../utils/helpers';
import { FiscalRegimes } from '../../domain/account/SUnit';
import SearchInput from '../SearchInput';
import { zipCodes } from '../../domain/account/zipCodes';
// components

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type LegalInfoFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  legalInfoState?: LegalBusinessType;
};

const LegalInfoForm: React.FC<LegalInfoFormProps> = ({
  onSuccessCallback,
  legalInfoState = {
    legalRepresentative: '',
    idData: undefined,
    legalBusinessName: '',
    csfData: undefined,
    actConstData: undefined,
    fiscalRegime: undefined,
    zipCode: undefined,
    satRfc: undefined,
  }
}) => {
  const isMountedRef = useIsMountedRef();
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { business } = useAppSelector((state) => state.account);
  const { sessionToken } = useAuth();
  const [fileID, setFileID] = useState<File | undefined>(legalInfoState.idData);
  const [fileActConst, setFileActConst] = useState<File | undefined>(
    legalInfoState.actConstData
  );
  const [fileCsf, setFileCsf] = useState<File | undefined>(
    legalInfoState.csfData
  );
  const [checked, setChecked] = useState(false);
  const fileMap = {
    idData: fileID,
    actConstData: fileActConst,
    csfData: fileCsf
  };

  useEffect(() => {
    if (!legalInfoState) return;
    if (legalInfoState.satRfc === "XAXX010101000") {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [legalInfoState]);

  const handleFileIDUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileID(e.target.files[0]);
      // call formik onchange to validat
      idProps.onChange(e);
    }
  };

  const handleFileActConstUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileActConst(e.target.files[0]);
      // call formik onchange to validat
      actConstProps.onChange(e);
    }
  };

  const handleFileCsftUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileCsf(e.target.files[0]);
      // call formik onchange to validat
      csfProps.onChange(e);
    }
  };

  const LegalInfoSchema = Yup.object().shape({
    legalRepresentative: Yup.string().max(
      512,
      'Nombre de Representante Legal muy largo.'
    ),
    legalBusinessName: Yup.string().max(
      512,
      'Nombre de la Razón Social muy largo.'
    ),
    idData: Yup.mixed(),
    actConstData: Yup.mixed(),
    csfData: Yup.mixed()
  });

  const formik = useFormik({
    // makes sure that the form has correct initial values if a file is passed
    initialValues: {
      ...legalInfoState,
      idData: undefined,
      actConstData: undefined,
      csfData: undefined
    },
    validationSchema: LegalInfoSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // redux
        await dispatch(
          setLegalBusiness(
            business.id,
            {
              ...values,
              ...fileMap
            },
            sessionToken || ''
          )
        );
        if (isMountedRef.current) {
          setSubmitting(false);
        }
        // callback - [TODO] send response data
        onSuccessCallback(true);
      } catch (error) {
        enqueueSnackbar(
          'Error actualizando información legal. Por favor intenta de nuevo.',
          {
            variant: 'error',
            action: (key) => (
              <IconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </IconButton>
            )
          }
        );
        if (isMountedRef.current) {
          setSubmitting(false);
          // redux
          // dispatch(raiseError(error));
        }
        onSuccessCallback(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } = formik;
  const allValues = Object.keys(errors).length === 0;

  const idProps = getFieldProps('idData');
  const actConstProps = getFieldProps('actConstData');
  const csfProps = getFieldProps('csfData');

  // zipcode handler
  const handleZip = (option: {
    label: string;
    value: string;
  }) => {
    setFieldValue('zipCode', option.value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    if (isChecked) {
      setFieldValue('satRfc', "XAXX010101000");
    } else {
      setFieldValue('satRfc', "");
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Agrega el nombre del Representate Legal, en caso de ser persona
              física agrega tu Nombre Completo.
            </Typography>
            <TextField
              fullWidth
              label="Nombre del Representante Legal"
              {...getFieldProps('legalRepresentative')}
              error={Boolean(
                touched.legalRepresentative && errors.legalRepresentative
              )}
              helperText={
                touched.legalRepresentative && errors.legalRepresentative
              }
            />
          </Box>

          <Box>
            {legalInfoState.idData && (
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: theme.typography.fontWeightBold }}
              >
                Ya tenemos tu&nbsp;
                <Link
                  to={createBlobURI(legalInfoState.idData as File)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={legalInfoState.idData?.name || 'INE'}
                  component={RouterLink}
                >
                  Identificación Oficial
                </Link>
                , sube otro archivo para actualizarla.
              </Typography>
            )}
            <TextField
              fullWidth
              type="file"
              label="INE o Identificación Oficial"
              {...getFieldProps('idData')}
              onChange={handleFileIDUpload}
              error={Boolean(touched.idData && errors.idData)}
              helperText={touched.idData && errors.idData}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UploadFileIcon />
                  </InputAdornment>
                ),
                componentsProps: {
                  input: {
                    accept: '.pdf,.png,.jpg,.jpeg'
                  }
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.primary">
              Personas Morales
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Agrega nombre de la Razón Social de tu negocio, y su respectiva
              Acta Constitutiva.
            </Typography>
            <TextField
              fullWidth
              label="Nombre de Razón Social"
              {...getFieldProps('legalBusinessName')}
              error={Boolean(
                touched.legalBusinessName && errors.legalBusinessName
              )}
              helperText={touched.legalBusinessName && errors.legalBusinessName}
            />
          </Box>
          <Box sx={{ marginTop: '20px' }}>
            {legalInfoState.actConstData && (
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: theme.typography.fontWeightBold }}
              >
                Ya tenemos tu&nbsp;
                <Link
                  to={createBlobURI(legalInfoState.actConstData as File)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={
                    legalInfoState.actConstData?.name || 'Acta Constitutiva'
                  }
                  component={RouterLink}
                >
                  Acta Constitutiva
                </Link>
                , sube otro archivo para actualizarla.
              </Typography>
            )}
            <TextField
              fullWidth
              type="file"
              label="Acta Constitutiva"
              {...getFieldProps('actConstData')}
              onChange={handleFileActConstUpload}
              error={Boolean(touched.actConstData && errors.actConstData)}
              helperText={touched.actConstData && errors.actConstData}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UploadFileIcon />
                  </InputAdornment>
                ),
                componentsProps: {
                  input: {
                    accept: '.pdf,.png,.jpg,.jpeg'
                  }
                }
              }}
            />
          </Box>
          <Box>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={handleChange} />}
              label="No necesito factura"
            />
          </Box>
          <Box>
            {!checked && (
              <>
                <Box>
                  <Typography variant="subtitle1" color="text.primary">
                    Información de facturación
                  </Typography>
                </Box>
                <Box sx={{ marginTop: '20px' }}>
                  <TextField
                    fullWidth
                    label="Nombre de Contribuyente"
                    value={values.legalBusinessName}
                    onChange={(event) => { }}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ marginTop: '20px' }}>
                  {legalInfoState.csfData && (
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontWeight: theme.typography.fontWeightBold }}
                    >
                      Ya tenemos tu&nbsp;
                      <Link
                        to={createBlobURI(legalInfoState.csfData as File)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={
                          legalInfoState.csfData?.name || 'Constancia de Situación Fiscal'
                        }
                        component={RouterLink}
                      >
                        Constancia de Situación Fiscal
                      </Link>
                      , sube otro archivo para actualizarla.
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    type="file"
                    label="Constancia de Situación Fiscal"
                    {...getFieldProps('csfData')}
                    onChange={handleFileCsftUpload}
                    error={Boolean(touched.csfData && errors.csfData)}
                    helperText={touched.csfData && errors.csfData}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UploadFileIcon />
                        </InputAdornment>
                      ),
                      componentsProps: {
                        input: {
                          accept: '.pdf,.png,.jpg,.jpeg,'
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ marginTop: '20px' }}>
                  <TextField
                    fullWidth
                    select
                    label="Régimen Fiscal"
                    {...getFieldProps("fiscalRegime")}
                    error={Boolean(touched.fiscalRegime && errors.fiscalRegime)}
                    helperText={
                      (touched.fiscalRegime && errors.fiscalRegime) as ReactNode
                    }
                  >
                    {/* iter over fiscal regimes in alphabetical order */}
                    {FiscalRegimes.sort((a, b): number =>
                      b.label === a.label ? 0 : b.label > a.label ? -1 : 1
                    ).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Grid container>
                  <Grid item xs={4} lg={4} mt={2} sx={{ pr: theme.spacing(2) }}>
                    <TextField
                      fullWidth
                      label="RFC"
                      {...getFieldProps('satRfc')}
                      error={Boolean(touched.satRfc && errors.satRfc)}
                      helperText={touched.satRfc && errors.satRfc}
                    />
                  </Grid>
                  <Grid item xs={8} lg={8} mt={2}>
                    <SearchInput
                      fullWidth
                      label="Código Postal"
                      options={zipCodes}
                      onSelectOption={handleZip}
                      defaultValue={
                        legalInfoState.zipCode
                          ? zipCodes.find((z) => z.value === legalInfoState.zipCode) ||
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
              </>
            )}
          </Box>

          <LoadingButton
            fullWidth
            disabled={!allValues}
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Actualizar Datos
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider >
  );
};

export default LegalInfoForm;
