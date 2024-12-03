import { ReactNode } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// redux
// hooks
// components
import SearchInput from "../SearchInput";
// domain
import { zipCodes } from "../../domain/account/zipCodes";
import track from "../../utils/analytics";
import {
  CfdiUses,
  FiscalRegimes,
  InvoicePaymentMethods,
  InvoicingTriggers,
} from "../../domain/account/SUnit";
//

type InvoiceClientFormProps = {
  theme: Theme;
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<FormikErrors<FormikValues>> | Promise<void>;
  touched: FormikTouched<FormikValues>;
  errors: FormikErrors<FormikValues>;
  defaultValues?: { [key: string]: any };
  editMode?: boolean;
};

const InvoicClientForm: React.FC<InvoiceClientFormProps> = ({
  theme,
  getFieldProps,
  setFieldValue,
  touched,
  errors,
  defaultValues,
  editMode = false,
}) => {
  const handleTaxZip = (option: {
    label: string;
    value: string;
    estate?: string;
    city?: string;
  }) => {
    // update formik values
    setFieldValue("taxZipCode", option.value);
  };

  return (
    <Accordion
      sx={{ mb: theme.spacing(2), py: theme.spacing(1) }}
      onChange={(e: any, expanded: boolean) => {
        track("select_item", {
          visit: window.location.toString(),
          page: "Client",
          section: "InvoiceClientForm",
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
            label="RFC"
            {...getFieldProps("taxId")}
            error={Boolean(touched.taxId && errors.taxId)}
            helperText={(touched.taxId && errors.taxId) as ReactNode}
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              setFieldValue("taxId", v);
            }}
          />

          <TextField
            fullWidth
            label="Nombre o Razón Social"
            {...getFieldProps("taxName")}
            error={Boolean(touched.taxName && errors.taxName)}
            helperText={(touched.taxName && errors.taxName) as ReactNode}
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              setFieldValue("taxName", v);
            }}
          />

          <TextField
            fullWidth
            label="Dirección Fiscal"
            {...getFieldProps("taxAddress")}
            error={Boolean(touched.taxAddress && errors.taxAddress)}
            helperText={
              touched.taxAddress &&
              (typeof errors.taxAddress === 'string' ? (
                errors.taxAddress
              ) : (
                <>
                  {getFieldProps("taxAddress").value && getFieldProps("taxAddress").value.length > 100 && (
                    <span style={{ color: 'orange' }}>
                      Advertencia: La dirección fiscal supera los 100 caracteres.
                    </span>
                  )}
                </>
              ))
            }
          />

          <Grid container>
            <Grid item xs={7} lg={7} sx={{ pr: theme.spacing(2) }}>
              <TextField
                fullWidth
                select
                label="Uso de CFDI"
                {...getFieldProps("cfdiUse")}
                error={Boolean(touched.cfdiUse && errors.taxZipCcfdiUseode)}
                helperText={(touched.cfdiUse && errors.cfdiUse) as ReactNode}
              >
                {CfdiUses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {`${option.label}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={5} lg={5}>
              <SearchInput
                fullWidth
                label="Código Postal"
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
          <TextField
            fullWidth
            label="Email para Facturación"
            {...getFieldProps("invoiceEmail")}
            error={Boolean(touched.invoiceEmail && errors.invoiceEmail)}
            helperText={
              (touched.invoiceEmail && errors.invoiceEmail) as ReactNode
            }
          />
          <Grid>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Configuración para Facturación Automática para este cliente.
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
          </Grid>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default InvoicClientForm;
