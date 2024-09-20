// material
import { useTheme, Box, Typography, Grid, Divider } from "@mui/material";
// domain
import {
  SupplierProductType,
  UOMType,
  UOMTypes,
} from "../../domain/supplier/SupplierProduct";
// components
import ExpandableCard from "../ExpandableCard";
import { buildImageUrl } from "../../utils/imagesCdn";

// ----------------------------------------------------------------------

type SPAttributesProps = {
  attrName: string;
  attrValue: any;
};

const SPAttributes: React.FC<SPAttributesProps> = (props) => {
  const { attrName, attrValue } = props;
  return (
    <Grid container>
      <Grid item xs={8} md={6}>
        <Typography variant="body2" color="text.secondary">
          {attrName}
        </Typography>
      </Grid>
      <Grid item xs={4} md={6}>
        <Typography variant="body2" color={"text.secondary"}>
          {attrValue}
        </Typography>
      </Grid>
    </Grid>
  );
};

// ----------------------------------------------------------------------

type SupplierProductCardItemProps = {
  supplierProduct: SupplierProductType;
  onClick?: () => void;
  other?: any;
};

const SupplierProductCardItem: React.FC<SupplierProductCardItemProps> = ({
  supplierProduct,
  onClick = () => {},
  other = {},
}) => {
  const theme = useTheme();
  const displayAttrs = [
    { key: "upc", value: "UPC" },
    { key: "productCategory", value: "Categoría" }, // [TODO]
    { key: "conversionFactor", value: "Factor de Conversión" },
    { key: "buyUnit", value: "U. de Compra" },
    // minimum
    // { key: 'minimumQuantity', value: 'Cantidad Mínima' },
    // unit mult
    // { key: 'unitMultiple', value: 'Incrementos' },
    // est weight
    { key: "estimatedWeight", value: "Peso Estimado (Kg)" },
    // stock min
    {
      key: "stock",
      value: `Disponibilidad (${
        UOMTypes[supplierProduct.sellUnit.toLowerCase() as UOMType]
      })`,
    },
  ];

  const displayMapping = (field: string, val: any) => {
    if (field === "sellUnit" || field === "buyUnit") {
      return UOMTypes[val.toLowerCase() as UOMType];
    } else {
      return val;
    }
  };

  const defaultImg = "/static/assets/alima/alima-leaf.jpg";
  const coverImg =
    supplierProduct &&
    supplierProduct.images &&
    supplierProduct.images.length > 0
      ? buildImageUrl(supplierProduct.images[0].imageUrl, 48)
      : defaultImg;

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
      subtitle={UOMTypes[supplierProduct.sellUnit.toLowerCase() as UOMType]}
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
          <Grid item xs={6} md={4}>
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
          <Grid item xs={6} md={4}>
            <Typography
              variant="body2"
              align="left"
              sx={{
                pl: 3,
                color: "text.secondary",
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              <b>Mín. de Compra</b>: {supplierProduct.minimumQuantity}{" "}
              {displayMapping("sellUnit", supplierProduct.sellUnit)}
            </Typography>
          </Grid>
          {/* Incr */}
          <Grid item xs={12} md={4}>
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
              <b>Incrementos</b>: {supplierProduct.unitMultiple}{" "}
              {displayMapping("sellUnit", supplierProduct.sellUnit)}
            </Typography>
          </Grid>
        </Grid>
      }
      options={[{ label: "Editar Producto", onClick: onClick }]}
      expandedContent={
        <Box sx={{ px: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <b>Atributos</b>
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {displayAttrs.map((c, j) => {
            const aVal = supplierProduct[c.key as keyof SupplierProductType];
            if (!aVal) return null;
            const dispVal = displayMapping(c.key, aVal);
            return (
              <SPAttributes key={j} attrName={c.value} attrValue={dispVal} />
            );
          })}
          <Divider sx={{ mt: 1, mb: 1 }} />
        </Box>
      }
    />
  );
};

export default SupplierProductCardItem;
