import { ChangeEvent, ReactNode, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
// material
import {
  FormikErrors,
  FieldInputProps,
  FormikTouched,
  FormikValues,
} from "formik";
import {
  Stack,
  TextField,
  MenuItem,
  Grid,
  Theme,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
// components
import SearchInput from "../SearchInput";
// domain
import { zipCodes } from "../../domain/account/zipCodes";
import {
  FiscalRegimes,
  InvoicePaymentMethods,
  InvoicingTriggers,
} from "../../domain/account/SUnit";
// utils
import track from "../../utils/analytics";
import { createBlobURI } from "../../utils/helpers";
import { Icon } from "@iconify/react";

//

type InvoiceSUnitFormProps = {
  theme: Theme;
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<FormikErrors<FormikValues>> | Promise<void>;
  setFileCert: (file: File) => void;
  setFileSecrets: (file: File) => void;
  touched: FormikTouched<FormikValues>;
  errors: FormikErrors<FormikValues>;
  defaultValues?: { [key: string]: any };
  editMode?: boolean;
};

const InvoiceSUnitForm: React.FC<InvoiceSUnitFormProps> = ({
  theme,
  getFieldProps,
  setFieldValue,
  setFileCert,
  setFileSecrets,
  touched,
  errors,
  defaultValues,
  editMode = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const certProps = getFieldProps("certificateFile");
  const secretProps = getFieldProps("secretsFile");

  const handleFileCertUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileCert(e.target.files[0]);
      // call formik onchange to validate
      certProps.onChange(e);
    }
  };

  const handleFileSecretsUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileSecrets(e.target.files[0]);
      // call formik onchange to validat
      secretProps.onChange(e);
    }
  };

  const handleTaxZip = (option: {
    label: string;
    value: string;
    estate?: string;
    city?: string;
  }) => {
    // update formik values
    setFieldValue("taxZipCode", option.value);
  };

  const handleShowPassword = () => {
    setShowPassword((show: boolean) => !show);
  };

  return (
    <Accordion
      sx={{ mb: theme.spacing(2), py: theme.spacing(1) }}
      onChange={(e: any, expanded: boolean) => {
        track("select_item", {
          visit: window.location.toString(),
          page: "SUnit",
          section: "InvoiceSUnitForm",
          expanded: expanded,
        });
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container direction="row" spacing={1}>
          <Grid item xs={12} lg={12}>
            <Typography>Información de facturación (opcional)</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
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

          <TextField
            fullWidth
            label="Nombre o Razón Social"
            {...getFieldProps("legalBusinessName")}
            error={Boolean(
              touched.legalBusinessName && errors.legalBusinessName
            )}
            helperText={
              (touched.legalBusinessName &&
                errors.legalBusinessName) as ReactNode
            }
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              setFieldValue("legalBusinessName", v);
            }}
          />
          <Grid container>
            <Grid item xs={7} lg={7} sx={{ pr: theme.spacing(2) }}>
              <TextField
                fullWidth
                label="RFC"
                {...getFieldProps("taxId")}
                error={Boolean(touched.taxId && errors.taxId)}
                helperText={(touched.taxId && errors.taxId) as ReactNode}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  setFieldValue("taxId", v);
                }}
              />
            </Grid>
            <Grid item xs={5} lg={5}>
              <SearchInput
                fullWidth
                label="C.P."
                options={zipCodes}
                onSelectOption={handleTaxZip}
                defaultValue={
                  editMode
                    ? zipCodes.find(
                        (z) => z.value === defaultValues?.taxZipCode
                      ) || undefined
                    : undefined
                }
                fieldProps={{
                  error: Boolean(touched.taxZipCode && errors.taxZipCode),
                  helperText: (touched.taxZipCode &&
                    errors.taxZipCode) as ReactNode,
                }}
              />
            </Grid>
          </Grid>

          {/* Invoicing files */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para poder generar tus facturas en automático necesitamos que carges
            tus archivos del Certificado de Sello Digital (CSD).
          </Typography>
          <Box>
            {defaultValues?.certificateFile && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ya tenemos tu&nbsp;
                <Link
                  to={createBlobURI(defaultValues?.certificateFile as File)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={
                    defaultValues?.certificateFile?.name || "archivo.cer"
                  }
                  component={RouterLink}
                >
                  CSD (.cer)
                </Link>
                , sube otro archivo para actualizarlo.
              </Typography>
            )}
            <TextField
              fullWidth
              type="file"
              label="CSD: Archivo (.cer)"
              {...getFieldProps("certificateFile")}
              onChange={handleFileCertUpload}
              error={Boolean(touched.certificateFile && errors.certificateFile)}
              helperText={
                (touched.certificateFile && errors.certificateFile) as ReactNode
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UploadFileIcon />
                  </InputAdornment>
                ),
                componentsProps: {
                  input: {
                    accept: ".cer",
                  },
                },
              }}
            />
          </Box>

          <Box>
            {defaultValues?.secretsFile && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ya tenemos tu&nbsp;
                <Link
                  to={createBlobURI(defaultValues?.secretsFile as File)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={defaultValues?.secretsFile?.name || "archivo.key"}
                  component={RouterLink}
                >
                  CSD (.key)
                </Link>
                , sube otro archivo para actualizarlo.
              </Typography>
            )}
            <TextField
              fullWidth
              type="file"
              label="CSD: Archivo (.key)"
              {...getFieldProps("secretsFile")}
              onChange={handleFileSecretsUpload}
              error={Boolean(touched.secretsFile && errors.secretsFile)}
              helperText={
                (touched.secretsFile && errors.secretsFile) as ReactNode
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UploadFileIcon />
                  </InputAdornment>
                ),
                componentsProps: {
                  input: {
                    accept: ".key",
                  },
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Clave de Acceso (CSD)"
            {...getFieldProps("passphrase")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.passphrase && errors.passphrase)}
            helperText={(touched.passphrase && errors.passphrase) as ReactNode}
          />

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Configuración para Facturación Automática.
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                select
                label="Tipo de Factura"
                {...getFieldProps("invoicePaymentMethod")}
                error={Boolean(
                  touched.invoicePaymentMethod && errors.invoicePaymentMethod
                )}
                helperText={
                  (touched.invoicePaymentMethod &&
                    errors.invoicePaymentMethod) as ReactNode
                }
              >
                {Object.entries(InvoicePaymentMethods).map((option) => (
                  <MenuItem key={option[0]} value={option[0]}>
                    {option[1]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Facturación Automática"
                {...getFieldProps("invoicingTrigger")}
                error={Boolean(
                  touched.invoicingTrigger && errors.invoicingTrigger
                )}
                helperText={
                  (touched.invoicingTrigger &&
                    errors.invoicingTrigger) as ReactNode
                }
              >
                {Object.entries(InvoicingTriggers).map((option) => (
                  <MenuItem key={option[0]} value={option[0]}>
                    {option[1]}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default InvoiceSUnitForm;
