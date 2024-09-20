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
} from "@mui/material";
// hooks
// import { useAppDispatch } from '../../redux/store';
// styles
import { paystatusChip, statusChip } from "../../styles/mappings";
// routes
import { PATH_APP } from "../../routes/paths";
// domain
import {
  InvoiceType,
  OrdenType,
  ordenStatusTypes,
  paymentStatusTypes,
} from "../../domain/orden/Orden";
import { fCurrency, fISODate } from "../../utils/helpers";
import MHidden from "../extensions/MHidden";
import { Link } from "react-router-dom";

// ----------------------------------------------------------------------
type OrdenCardProps = {
  orden: OrdenType & { invoice?: InvoiceType };
  theme: Theme;
};

const NormalOrdenCard: React.FC<OrdenCardProps> = ({ orden, theme }) => {
  const colorChip = statusChip(theme, orden);
  const payColorChip = paystatusChip(theme, orden);
  return (
    <Grid
      container
      spacing={1}
      sx={{ mt: theme.spacing(1), cursor: "pointer" }}
    >
      <Grid item xs={6} lg={8}>
        <Typography variant="subtitle2">
          {orden.restaurantBranch?.displayName} -{" "}
          {orden.restaurantBranch?.branchName || ""}
          {orden.deliveryType === "pickup"
            ? " (Recoge en Almacén)"
            : " (Entrega)"}
        </Typography>
        <Typography variant="subtitle2" color={"text.secondary"} noWrap>
          ID:&nbsp;{orden.id || ""}
        </Typography>
        <Typography variant="subtitle2" color={"text.secondary"} noWrap>
          {"# Pedido: "}
          {orden.ordenNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          <b>{orden.total ? fCurrency(orden.total) + "," : ""}</b>{" "}
          {orden.cart.cartProducts.length} producto
          {orden.cart.cartProducts.length > 1 ? "s" : ""}
        </Typography>
        {orden.paystatus && (
          <Box justifyContent={"flex-start"}>
            <Chip
              label={paymentStatusTypes[orden.paystatus]}
              sx={{
                mt: theme.spacing(1),
                px: theme.spacing(2),
                backgroundColor: payColorChip,
                color: theme.palette.common.white,
                fontWeight: "bold",
              }}
            />
          </Box>
        )}
      </Grid>
      <Grid item xs={6} lg={3} sx={{ textAlign: "right" }}>
        <Box sx={{ mt: theme.spacing(0.5) }}>
          <MHidden width="mdDown">
            {/* Desktop */}
            <Typography variant="subtitle2" color="text.secondary">
              {`${fISODate(orden.deliveryDate)}`} {`(${orden.deliveryTime}hrs)`}
            </Typography>
          </MHidden>
          <MHidden width="mdUp">
            {/* Mobile */}
            <Typography variant="subtitle2" color="text.secondary">
              {`${fISODate(orden.deliveryDate)}`} <br />{" "}
              {`(${orden.deliveryTime}hrs)`}
            </Typography>
          </MHidden>
        </Box>
        {orden.status && (
          <Box justifyContent={"flex-end"} sx={{ textAlign: "right" }}>
            <Chip
              label={ordenStatusTypes[orden.status]}
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
        {orden.invoice?.uuid && (
          <Box justifyContent={"flex-end"} sx={{ textAlign: "right" }}>
            <Chip
              label="c/ Factura"
              sx={{
                mt: theme.spacing(0.5),
                px: theme.spacing(3),
                backgroundColor: theme.palette.secondary.dark,
                color: theme.palette.common.white,
                fontWeight: "bold",
              }}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

type OrdenCardItemProps = {
  orden: OrdenType & { invoice?: InvoiceType };
};

const OrdenCardItem: React.FC<OrdenCardItemProps> = ({ orden }) => {
  const theme = useTheme();

  return (
    <Link
      to={orden.id ? PATH_APP.orden.details.replace(":ordenId", orden.id) : "#"}
      style={{ textDecoration: "none" }}
    >
      <Card sx={{ mb: theme.spacing(1), boxShadow: theme.shadows[2] }}>
        <CardContent>
          <NormalOrdenCard orden={orden} theme={theme} />
        </CardContent>
      </Card>
    </Link>
  );
};

export default OrdenCardItem;
