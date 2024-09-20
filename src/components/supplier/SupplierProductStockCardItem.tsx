// material
import { useTheme, Box, Typography, Grid, Chip } from "@mui/material";
// domain
import {
  SupplierProductType,
  UOMType,
  UOMTypes,
} from "../../domain/supplier/SupplierProduct";
// components
import ExpandableCard from "../ExpandableCard";
import { buildImageUrl } from "../../utils/imagesCdn";
import { fDateTime } from "../../utils/helpers";

// ----------------------------------------------------------------------

type SupplierProductStockCardItemProps = {
  supplierProduct: SupplierProductType;
//   onClick?: () => void;
  other?: any;
};

const SupplierProductStockCardItem: React.FC<SupplierProductStockCardItemProps> = ({
  supplierProduct,
//   onClick = () => {},
  other = {},
}) => {
  const theme = useTheme();

  const displayMapping = (field: string, val: any) => {
    if (field === "buyUnit") {
      return UOMTypes[val.toLowerCase() as UOMType];
    } else {
      return val;
    }
  };

  function roundStockAvailability(availability: number): number {
    const roundedValue = Math.round(availability * 1000) / 1000;
    const strValue = roundedValue.toString();
    
    // Remove unnecessary trailing zeros
    return parseFloat(strValue);
}

  const defaultImg = "/static/assets/alima/alima-leaf.jpg";
  const coverImg =
    supplierProduct &&
    supplierProduct.images &&
    supplierProduct.images.length > 0
      ? buildImageUrl(supplierProduct.images[0].imageUrl, 48)
      : defaultImg;

  const sUnit =
  Object.entries(UOMTypes).find(
    (s) =>
      s[0].toUpperCase() ===
      supplierProduct.sellUnit.toUpperCase()
  )?.[1] || supplierProduct.sellUnit;

  return (
    <ExpandableCard
      title={
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: theme.typography.fontWeightRegular }}
        >
          {supplierProduct.productDescription}
        </Typography>
      }
      subtitle={
        <>
          {sUnit}{" "}
          {supplierProduct.stock?.availability !== undefined && (
            
            <Chip
              key={supplierProduct.id}
              label={
                <>
                  <b>{`Disponibilidad: ${roundStockAvailability(supplierProduct.stock.availability)} (${sUnit})`}</b>
                </>
              }
              sx={{
                m: 0.5,
                ml: {
                  xs: 0, // No left margin on mobile
                  sm: 2  // Left margin of 2 on desktop
                }
              }}
              size="small"
              variant="outlined"
              color={supplierProduct.stock.availability > 0.1*(supplierProduct.stock.amount) ? "success": supplierProduct.stock.availability === 0 ? "error":"warning"}
            />
          )}
        </>}
      avatar={
        <>
          <Box
            component="img"
            alt={supplierProduct.productDescription}
            data-src={coverImg}
            src={coverImg}
            className="lazyload blur-up"
            sx={{
              mr: 2,
              width: 48,
              height: 48,
              borderRadius: 1.5,
            }}
          />
        </>
      }
      actions={
        <Grid container>
          {/* SKU */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="body2"
              align="left"
              sx={{
                pl: 3,
                color: "text.secondary",
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              <b>SKU</b>: {supplierProduct.sku}
            </Typography>
          </Grid>
          {/* Min Qty */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="body2"
              align="left"
              sx={{
                pl: 3,
                color: "text.secondary",
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              <b>Inventario</b>: {supplierProduct.stock?.amount}{" "}
              {displayMapping("buyUnit", supplierProduct.sellUnit)}
            </Typography>
          </Grid>
          {/* Incr */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="body2"
              align="left"
              sx={{
                pl: 3,
                color: "text.secondary",
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              <b>Vender sin inventario</b>: {supplierProduct.stock?.keepSellingWithoutStock ? 'Sí' : 'No' }{" "}
            </Typography>
          </Grid>
          {/* Incr */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="body2"
              align="left"
              sx={{
                pl: 3,
                color: "text.secondary",
                fontWeight: theme.typography.fontWeightRegular,
                pb: { xs: 1, md: 0 },
              }}
            >
              <i><b>Ult. Act: </b>{fDateTime(supplierProduct.stock?.createdAt)}{" "}</i>
            </Typography>
          </Grid>
        </Grid>
      }
    />
  );
};

export default SupplierProductStockCardItem;
