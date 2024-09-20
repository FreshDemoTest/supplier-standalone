// material
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';

// domain
import {
  OrdenType,
  ordenStatusTypes,
  paymentMethodType,
  paymentMethods
} from '../../domain/orden/Orden';
import { UOMTypes } from '../../domain/supplier/SupplierProduct';
// utils
import { fCurrency, fISODate, fQuantity } from '../../utils/helpers';
// styles
import { statusChip } from '../../styles/mappings';
import {
  RemisionGridStyle,
  SummaryRowPdf
} from '../../styles/tables/ordenTable';

// ----------------------------------------------------------------------

type OrdenDetailsPdfProps = {
  ordenReceipt: OrdenType;
  business: any;
  summaryItems: { label: string; value: number | undefined }[];
};

const OrdenDetailsPdf: React.FC<OrdenDetailsPdfProps> = ({
  ordenReceipt,
  business,
  summaryItems
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        my: theme.spacing(3),
        mr: theme.spacing(2),
        ml: theme.spacing(4),
        width: '540px'
      }}
    >
      <Box>
        <Grid container>
          <Grid item xs={12} sm={12} lg={12}>
            <img
              src="/static/assets/alima/alima_logo.png"
              alt="alima-logo"
              width={'90px'}
              style={{ marginTop: '10px', marginBottom: '10px' }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container>
          {/* Nota remision */}
          <RemisionGridStyle item xs={8} sm={8} lg={8}>
            <Typography
              variant="h6"
              sx={{ fontWeight: theme.typography.fontWeightLight }}
            >
              Nota de Remisión
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: theme.typography.h6.fontWeight }}
            >
              ID: {ordenReceipt.id}
            </Typography>
            <Typography variant="body2"
              sx={{ fontWeight: theme.typography.h6.fontWeight }}
            >
              {"# Pedido: "}{ordenReceipt.ordenNumber}
            </Typography>
            <Typography variant="body2">
              Tipo de pago:{' '}
              {
                paymentMethods[
                ordenReceipt.paymentMethod?.toLowerCase() as paymentMethodType
                ]
              }
            </Typography>
          </RemisionGridStyle>
          {/* Status  */}
          <Grid item xs={3} sm={3} lg={3}>
            <Box
              sx={{
                textTransform: 'none',
                backgroundColor:
                  ordenReceipt.ordenType?.toLowerCase() === 'normal'
                    ? statusChip(theme, ordenReceipt)
                    : theme.palette.action.disabled,
                color: theme.palette.common.white,
                fontWeight: theme.typography.fontWeightBold,
                borderRadius: '10px',
                minHeight: '40px',
                textAlign: 'center'
              }}
            >
              {ordenReceipt.ordenType?.toLowerCase() === 'normal'
                ? ordenStatusTypes[ordenReceipt.status]
                : 'Pre-Pedido'}
            </Box>
          </Grid>

          <Grid item xs={8} sm={8} lg={8}>
            {/* Cliente, direccion y fecha de entrega*/}
            <Grid container>
              {/* Cliente */}
              <Grid item xs={5} sm={5} lg={5}>
                <Typography
                  paragraph
                  variant="overline"
                  sx={{ color: 'text.disabled', mb: theme.spacing(0) }}
                >
                  Cliente
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: theme.typography.fontWeightMedium }}
                >
                  {ordenReceipt.restaurantBranch.displayName ||
                    business.displayName}
                </Typography>
                <Typography variant="body2">
                  {ordenReceipt.restaurantBranch.branchName}
                </Typography>
              </Grid>
              {/* Direccion de entrega */}
              <Grid item xs={12} sm={5}>
                {ordenReceipt.deliveryType !== 'pickup' && (
                  <Typography
                    paragraph
                    variant="overline"
                    sx={{
                      color: 'text.disabled',
                      mb: theme.spacing(0),
                      mt: { xs: theme.spacing(1), md: theme.spacing(0) }
                    }}
                  >
                    Dirección de Entrega
                  </Typography>
                )}

                {ordenReceipt.deliveryType !== 'pickup' && (
                  <Typography variant="body2">
                    {ordenReceipt.restaurantBranch.fullAddress}
                  </Typography>
                )}
                {ordenReceipt.deliveryType === 'pickup' && (
                  <Typography variant="body2">
                    {ordenReceipt.supplier?.fullAddress}
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid container>
              {/* Fecha de entrega */}
              <Grid item xs={5} sm={5} lg={5}>
                <Typography
                  paragraph
                  variant="overline"
                  sx={{
                    color: 'text.disabled',
                    mb: theme.spacing(0),
                    mt: theme.spacing(1)
                  }}
                >
                  Fecha de Entrega
                </Typography>
                <Typography variant="body2">
                  {!ordenReceipt.deliveryDate?.toString().includes('*')
                    ? fISODate(ordenReceipt.deliveryDate)
                    : ordenReceipt.deliveryDate}
                </Typography>
                <Typography variant="body2">
                  Entre ({ordenReceipt.deliveryTime}hrs)
                </Typography>
              </Grid>
              {/* comentarios de entrega */}
              <Grid item xs={6} sm={6} lg={6} sx={{ mt: 1 }}>
                <Typography
                  variant="overline"
                  paragraph
                  sx={{
                    color: 'text.disabled',
                    mb: theme.spacing(0)
                  }}
                >
                  Comentarios
                </Typography>
                <Typography variant="body2">
                  {' '}
                  {ordenReceipt.comments ? ordenReceipt.comments : '-'}{' '}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Proveedor  */}
          <Grid item xs={4} sm={4} lg={4}>
            <Grid container>
              <Grid item xs={12} sm={12} lg={12}>
                <Typography
                  variant="overline"
                  paragraph
                  sx={{ color: 'text.disabled', mb: theme.spacing(0) }}
                >
                  Proveedor
                </Typography>
                <Typography variant="body1">
                  <b>{ordenReceipt.supplier.displayName}</b>
                </Typography>
                <Typography variant="body1">
                  {ordenReceipt.supplier.unitName}
                </Typography>
              </Grid>

              {/* Tipo de Orden */}
              <Grid item xs={12} sm={12} lg={12}>
                <Typography
                  variant="overline"
                  paragraph
                  sx={{
                    color: 'text.disabled',
                    mb: theme.spacing(0),
                    mt: theme.spacing(1)
                  }}
                >
                  Tipo de Orden
                </Typography>
                <Box>
                  {ordenReceipt.ordenType.toLowerCase() === 'draft' && (
                    <Typography variant="body2">Pre-Pedido</Typography>
                  )}
                  {ordenReceipt.ordenType.toLowerCase() === 'normal' && (
                    <Typography variant="subtitle2">
                      Orden de Venta (
                      {ordenReceipt.deliveryType === 'pickup'
                        ? 'Recoger en Almacén'
                        : 'Entrega'}
                      )
                    </Typography>
                  )}
                  {ordenReceipt.ordenType.toLowerCase() === 'replacement' && (
                    <Typography variant="body2">Orden de Reposición</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Product List */}
        {/* sx={{ minWidth: 280 }} */}
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                '& th': { backgroundColor: 'transparent' }
              }}
            >
              <TableRow>
                <TableCell
                  width={20}
                  sx={{ color: theme.palette.text.disabled }}
                >
                  #
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  Producto
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  Cantidad
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  Precio Unit.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  Precio
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ordenReceipt.cart.cartProducts.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    borderBottom: (theme) =>
                      `solid 1px ${theme.palette.divider}`,
                    pt: 0
                  }}
                >
                  <TableCell sx={{ pt: 0 }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ minWidth: '180px', pt: 0 }}>
                    <Typography variant="subtitle2" align="center">
                      {row.supplierProduct.productDescription}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ pt: 0 }}>
                    {fQuantity(row.quantity)}
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: '120px', pt: 0 }}>
                    {fCurrency(row.price?.amount) +
                      ' / ' +
                      (Object.entries(UOMTypes).find(
                        (su) =>
                          su[0] === row.supplierProduct.sellUnit.toLowerCase()
                      )?.[1] || row.supplierProduct.sellUnit)}
                  </TableCell>
                  <TableCell align="right" sx={{ pt: 0 }}>
                    <Typography variant="subtitle2">
                      {fCurrency(row.total)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}

              {/* Subtotal w/o tax */}
              <SummaryRowPdf
                label="Subtotal (sin Impuestos)"
                value={ordenReceipt.subtotalWithoutTax}
                rowSx={{ pt: 0 }}
              />
              {/* Impuestos */}
              <SummaryRowPdf
                label="Impuestos"
                value={ordenReceipt.tax}
                rowSx={{ pt: 0 }}
              />
              {/* Subtotal */}
              <SummaryRowPdf
                label="Subtotal"
                value={ordenReceipt.subtotal}
                rowSx={{ pt: 0 }}
              />

              {/* Optional summary items */}
              {summaryItems
                .filter((v) => v.value)
                .map((item) => (
                  <SummaryRowPdf
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    rowSx={{ pt: 0 }}
                  />
                ))}
              {/* Total */}
              <SummaryRowPdf
                label="Total"
                value={ordenReceipt.total}
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  fontSize: theme.typography.h6.fontSize
                }}
                rowSx={{ pt: 0 }}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default OrdenDetailsPdf;
