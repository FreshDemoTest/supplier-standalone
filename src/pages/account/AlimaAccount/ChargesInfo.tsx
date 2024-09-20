import { useState } from "react";
// material
import { Box, Grid, Chip, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Avatar from "@mui/material/Avatar";
// layouts
// components
import SearchBar from "../../../components/SearchBar";
import ExpandableCard from "../../../components/ExpandableCard";
// utils
import {
  createBlobURI,
  fCurrency,
  fMonthYearDate,
  fNoCentsCurrency,
  fPercentDec,
} from "../../../utils/helpers";
// domain
import { AlimaInvoiceChargeType } from "../../../domain/account/Business";

// ----------------------------------------------------------------------

type ChargeConceptProps = {
  chargeType: string;
  chargeUnit: string;
  chargeAmount: number;
  chargeDescription: string;
  isTotal?: boolean;
};

const ChargeConcept: React.FC<ChargeConceptProps> = (props) => {
  const { chargeType, chargeUnit, chargeAmount, chargeDescription, isTotal } =
    props;
  return (
    <Grid container>
      <Grid item xs={6} md={5} sx={{ pr: 1 }}>
        <Typography variant="body1">{chargeType}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textTransform: "uppercase" }}
        >
          {chargeDescription}
        </Typography>
      </Grid>
      <Grid item xs={3} md={4}>
        {!isTotal && (
          <Typography
            variant="body2"
            color={"text.secondary"}
            sx={{ textTransform: "uppercase", pt: 1 }}
          >
            {chargeUnit}
          </Typography>
        )}
        {isTotal && (
          <Typography variant="subtitle1" align="left">
            <b>{chargeUnit}</b>
          </Typography>
        )}
      </Grid>
      <Grid item xs={2} md={2}>
        {!isTotal && (
          <Typography
            variant="body2"
            color={"text.secondary"}
            align="center"
            sx={{ pt: 1 }}
          >
            {fCurrency(chargeAmount)}
          </Typography>
        )}
        {isTotal && (
          <Typography variant="subtitle1" align="center">
            <b>{fCurrency(chargeAmount)}</b>
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

type ChargesCardProps = {
  invoiceId: string;
  invoiceName: string;
  emissionDate: Date;
  totalAmount: number;
  payedStatus: boolean;
  invCharges: AlimaInvoiceChargeType[];
  invoiceFiles?: File[];
  invoiceStatus?: String;
};

const ChargesCard: React.FC<ChargesCardProps> = (props) => {
  const {
    invoiceId,
    invoiceName,
    emissionDate,
    totalAmount,
    payedStatus,
    invCharges,
    invoiceFiles,
    invoiceStatus,
  } = props;
  const theme = useTheme();
  // const statusColorChip = statusChip(theme, orden);

  // rendering vars
  const payBefore = new Date(emissionDate);
  payBefore.setDate(emissionDate.getDate() + 7);
  const totalInvoice = invCharges?.reduce((a, b) => a + b.totalCharge, 0);
  const downloadOptions = invoiceFiles?.map((f) => ({
    label: `Descargar Factura (${f.name
      .split(".")
      .reverse()[0]
      .toUpperCase()})`,
    onClick: () => handleDownloadInvoice(f),
  }));

  // handler - download invoice files
  const handleDownloadInvoice = (tmpFile: File) => {
    const tUri = createBlobURI(tmpFile);
    // download from URI
    const link = document.createElement("a");
    link.href = tUri;
    link.download = tmpFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* List of Charges Info Form  */}
      <ExpandableCard
        title={`Factura #${invoiceId}`}
        subtitle={invoiceName}
        avatar={
          <Avatar
            sx={{
              bgcolor: payedStatus
                ? theme.palette.primary.main
                : theme.palette.error.main,
            }}
            aria-label="invoice"
          >
            <ReceiptIcon fontSize="small" />
          </Avatar>
        }
        actions={
          <Grid container sx={{ pl: 3, pb: 1 }}>
            <Grid item xs={3} md={2}>
              <Typography variant="body2" color="text.secondary">
                {payedStatus ? "Pagado" : "Por Pagar"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={4}>
              <Typography
                variant="body2"
                sx={{
                  color: payedStatus
                    ? "text.secondary"
                    : theme.palette.info.main,
                  fontWeight: payedStatus ? "normal" : "bold",
                }}
                align="center"
              >
                Total {fCurrency(totalAmount)}
              </Typography>
            </Grid>
            {invoiceStatus === "CANCELED" && (
              <Grid item xs={12} md={4}>
                <Chip
                  label={"Cancelada"}
                  sx={{
                    mt: {
                      xs: theme.spacing(1),
                      md: theme.spacing(-0.7),
                    },
                    ml: {
                      xs: theme.spacing(16),
                      md: theme.spacing(0),
                    },
                    mb: {
                      xs: theme.spacing(1),
                      md: theme.spacing(0),
                    },
                    px: theme.spacing(0),
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.common.white,
                    fontWeight: theme.typography.fontWeightBold,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              {!payedStatus && (
                <Typography variant="body2" color="text.secondary">
                  Antes del {fMonthYearDate(payBefore)}
                </Typography>
              )}
              {payedStatus && (
                <Typography variant="body2" color="text.secondary">
                  {" "}
                </Typography>
              )}
            </Grid>
          </Grid>
        }
        options={downloadOptions}
        expandedContent={
          <Box sx={{ pl: 3 }}>
            {invCharges.map((c) => (
              <ChargeConcept
                key={c.id}
                chargeType={c.chargeType}
                chargeDescription={
                  c.chargeAmountType === "%"
                    ? `Ventas: ${fCurrency(c.chargeBaseQuantity)}`
                    : `CEDIS: ${c.chargeBaseQuantity} U.`
                }
                chargeUnit={
                  c.chargeAmountType === "$"
                    ? `${fNoCentsCurrency(c.chargeAmount)}`
                    : `${fPercentDec(c.chargeAmount * 100)}`
                }
                chargeAmount={c.totalCharge}
                isTotal={false}
              />
            ))}
            <ChargeConcept
              chargeType=""
              chargeDescription=""
              chargeUnit="Total"
              chargeAmount={totalInvoice}
              isTotal={true}
            />
          </Box>
        }
      />
    </Box>
  );
};

const ChargesInfo: React.FC<{ charges: ChargesCardProps[] }> = ({
  charges,
}) => {
  const [searchText, setSearchText] = useState("");
  const filteredCharges = charges.filter(
    (ch) =>
      ch.invoiceName.toLowerCase().includes(searchText.toLowerCase()) ||
      ch.invoiceId.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{ my: 3 }}>
      <SearchBar
        placeholder="Buscar facturas"
        searchValue={searchText}
        searchCallback={setSearchText}
        searchResultsLength={filteredCharges.length}
      />
      {/* No charges found  */}
      {charges.length === 0 && (
        <Typography
          variant="h6"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          No se encontraron facturas disponibles.
        </Typography>
      )}
      {/* List of charges */}
      {filteredCharges.map((ch, i) => (
        <ChargesCard key={i} {...ch} />
      ))}
    </Box>
  );
};

export default ChargesInfo;
export { ChargeConcept };
