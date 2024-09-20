import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { OrdenType } from "../../domain/orden/Orden";
import { fCurrency, fISODate } from "../../utils/helpers";
import { ProductDetailsTable } from "./OrdenDetailsView";

type OrdenSummaryProps = {
  orden: OrdenType;
  sx?: any;
};

const OrdenSummary: React.FC<OrdenSummaryProps> = ({ orden, sx }) => {
  const theme = useTheme();
  return (
    <Box sx={{ ...sx }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Resumen de tu pedido
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mt: 1, fontWeight: theme.typography.fontWeightRegular }}
      >
        Cliente: {orden.restaurantBranch.branchName}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, fontWeight: theme.typography.fontWeightRegular }}
      >
        Entrega: {fISODate(orden.deliveryDate)} ({orden.deliveryTime} hrs)
      </Typography>
      {/* Products  */}
      <Box sx={{ mt: 0.5 }}>
        <ProductDetailsTable
          cartProds={orden.cart.cartProducts
            .filter((cp) => cp.quantity > 0)
            .map((cp) => ({
              ...cp,
              quantity: cp.quantity * (cp?.supplierProduct?.unitMultiple || 1),
            }))}
          summaryItems={[]}
          showTotals={false}
        />
      </Box>

      <Grid container sx={{ mt: 2 }}>
        {/* Subtotal before taxes */}
        <>
          <Grid item xs={12} lg={2} />
          <Grid item xs={8} lg={4}>
            <Typography variant="body1" color="text.secondary" align="left">
              Subtotal (antes de Impuestos)
            </Typography>
          </Grid>
          <Grid item xs={4} lg={4}>
            <Typography variant="body1" color="text.secondary" align="right">
              {fCurrency(orden.subtotalWithoutTax)}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={2} />
        </>
        {/* Tax */}
        <>
          <Grid item xs={12} lg={2} />
          <Grid item xs={6} lg={4}>
            <Typography variant="body1" color="text.secondary" align="left">
              Impuestos
            </Typography>
          </Grid>
          <Grid item xs={6} lg={4}>
            <Typography variant="body1" color="text.secondary" align="right">
              {fCurrency(orden.tax)}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={2} />
        </>
        {/* Subtotal before taxes */}
        <>
          <Grid item xs={12} lg={2} />
          <Grid item xs={6} lg={4}>
            <Typography variant="body1" color="text.secondary" align="left">
              Subtotal
            </Typography>
          </Grid>
          <Grid item xs={6} lg={4}>
            <Typography variant="body1" color="text.secondary" align="right">
              {fCurrency(orden.subtotal)}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={2} />
        </>
        {/* Discount */}
        {orden.discount?.amount && (
          <>
            <Grid item xs={12} lg={2} />
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="left">
                Descuentos
              </Typography>
            </Grid>
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="right">
                {`- ${fCurrency(orden.discount?.amount)}`}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={2} />
          </>
        )}
        {/* Shipping */}
        {!!orden.shippingCost ? (
          <>
            <Grid item xs={12} lg={2} />
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="left">
                Envío
              </Typography>
            </Grid>
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="right">
                {fCurrency(orden.shippingCost)}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={2} />
          </>
        ) : null}
        {/* Packaging */}
        {orden.packagingCost && (
          <>
            <Grid item xs={12} lg={2} />
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="left">
                Empaque
              </Typography>
            </Grid>
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="right">
                {fCurrency(orden.packagingCost)}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={2} />
          </>
        )}
        {/* Service Fee */}
        {orden.serviceFee && (
          <>
            <Grid item xs={12} lg={2} />
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="left">
                Servicio
              </Typography>
            </Grid>
            <Grid item xs={6} lg={4}>
              <Typography variant="body1" color="text.secondary" align="right">
                {fCurrency(orden.serviceFee)}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={2} />
          </>
        )}
        {/* Service Fee */}
        <>
          <Grid item xs={12} lg={2} />
          <Grid item xs={6} lg={4}>
            <Typography variant="subtitle1" color="text.primary" align="left">
              Total
            </Typography>
          </Grid>
          <Grid item xs={6} lg={4}>
            <Typography variant="subtitle1" color="text.primary" align="right">
              {fCurrency(orden.total)}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={2} />
        </>
      </Grid>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

export default OrdenSummary;
