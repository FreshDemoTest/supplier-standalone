// material
import {
  useTheme,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Theme,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
// hooks
// styles
// routes
import { PATH_APP } from "../../routes/paths";
// domain
import {
  InvoiceStatusTypes,
  InvoiceType,
  decodeInvoiceStatusTypes,
} from "../../domain/orden/Orden";
import { createBlobURI, fCurrency, fISODate } from "../../utils/helpers";

// ----------------------------------------------------------------------
type InvoiceCardProps = {
  invoice: InvoiceType & { relOrdenIds: string[] };
  theme: Theme;
};

const NormalInvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, theme }) => {
  const colorChip = invoice.status
    ? invoice.status === InvoiceStatusTypes.ACTIVE
      ? theme.palette.success.main
      : theme.palette.error.main
    : theme.palette.grey[100];
  return (
    <Grid container spacing={1} sx={{ mt: theme.spacing(1) }}>
      <Grid item xs={6} md={8}>
        <RouterLink
          to={PATH_APP.orden.details.replace(
            ":ordenId",
            invoice.associatedOrdenId
              ? `${invoice.associatedOrdenId}#invoice`
              : ""
          )}
          style={{ textDecoration: "none" }}
        >
          <Box sx={{ cursor: "pointer" }}>
            <Typography variant="subtitle2" color={"text.primary"}>
              {invoice.client?.branchName || ""}
            </Typography>
            <Typography variant="subtitle2" color={"text.secondary"} noWrap>
              SAT UUID: {invoice.uuid || ""} <br />
              Folio: {invoice.folio || ""}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Total: {fCurrency(invoice.total || 0)}
            </Typography>
          </Box>
        </RouterLink>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {invoice?.pdfFile && (
            <Link
              to={createBlobURI(invoice.pdfFile as File)}
              target="_blank"
              rel="noopener noreferrer"
              download={"factura-"+invoice.folio+".pdf" || "factura.pdf"}
              component={RouterLink}
              sx={{ mr: 2 }}
            >
              PDF
            </Link>
          )}
          {invoice?.xmlFile && (
            <Link
              to={createBlobURI(invoice.xmlFile as File)}
              target="_blank"
              rel="noopener noreferrer"
              download={"factura-"+invoice.folio+".xml" || "factura.xml"}
              component={RouterLink}
            >
              XML
            </Link>
          )}
        </Box>
      </Grid>
      <Grid item xs={6} md={4} sx={{ textAlign: "right" }}>
        <Box sx={{ mt: theme.spacing(0.5) }}>
          <Typography variant="subtitle2" color="text.secondary">
            {`Emisión: ${fISODate(invoice.createdAt)}`}
          </Typography>
        </Box>
        {invoice.status && (
          <Box justifyContent={"flex-end"} sx={{ textAlign: "right" }}>
            <Chip
              label={decodeInvoiceStatusTypes(invoice?.status || "")}
              sx={{
                mt: theme.spacing(1),
                px: theme.spacing(2),
                backgroundColor: colorChip,
                color: theme.palette.common.white,
                fontWeight: "bold",
              }}
            />
          </Box>
        )}
        {invoice.relOrdenIds && (
          <Box justifyContent={"flex-end"} sx={{ textAlign: "right" }}>
            {invoice.relOrdenIds.map((ordenId) => {
              return (
                <RouterLink
                  key={ordenId}
                  to={PATH_APP.orden.details.replace(":ordenId", ordenId)}
                >
                  <Chip
                    label={`Pedido: ${ordenId.slice(0, 10)}`}
                    sx={{
                      mt: theme.spacing(1),
                      px: theme.spacing(2),
                      backgroundColor: theme.palette.info.main,
                      color: theme.palette.common.white,
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  />
                </RouterLink>
              );
            })}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

type InvoiceCardItemProps = {
  invoice: InvoiceType & { relOrdenIds: string[] };
};

const InvoiceCardItem: React.FC<InvoiceCardItemProps> = ({ invoice }) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: theme.spacing(1), boxShadow: theme.shadows[2] }}>
      <CardContent>
        <NormalInvoiceCard invoice={invoice} theme={theme} />
      </CardContent>
    </Card>
  );
};

export default InvoiceCardItem;
