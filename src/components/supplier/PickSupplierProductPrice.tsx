import React, { useState, useEffect } from "react";
import Decimal from 'decimal.js';
// components
import { Icon } from "@iconify/react";
import trash2Fill from "@iconify/icons-eva/trash-2-fill";
import plusFill from "@iconify/icons-eva/plus-fill";
import {
  Box,
  Grid,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Button,
  InputAdornment,
  styled,
} from "@mui/material";
// redux
// hooks
// components
import MHidden from "../extensions/MHidden";
import SearchBar from "../SearchBar";
import AddProductToPriceListModal from "./AddProductToPriceListModal";
// utils
import { normalizeText } from "../../utils/helpers";
// domain
import { UOMTypes } from "../../domain/supplier/SupplierProduct";
import { PriceListDetailsType } from "../../domain/supplier/SupplierPriceList";
import { DynamicTableLoader } from "../DynamicLoader";

// ----------------------------------------------------------------------

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  minWidth: 280,
}));

// ----------------------------------------------------------------------

type PriceIncrementerProps = {
  onDelete: () => void;
  onSetPrice: (pr: number) => void;
  priceDetail: PriceListDetailsType;
};

const PriceIncrementer: React.FC<PriceIncrementerProps> = ({
  onDelete,
  onSetPrice,
  priceDetail,
}) => {
  const theme = useTheme();
  const [quant, _setQuant] = useState<number | string>(priceDetail.price.price);

  const setQuant = (value: number | string) => {
    if (typeof value === "string") {
      _setQuant(value);
      return value;
    } else {
      if (value.toString() === "NaN") {
        _setQuant(0);
        return value;
      }
      const _val = new Decimal(value).toDecimalPlaces(2).toNumber();
      if (_val < 0)
      {
        _setQuant(0);
        return 0;
      }
      _setQuant(_val);
      return _val;
    }
  };

  useEffect(() => {
    setQuant(priceDetail.price.price);
  }, [priceDetail.price]);

  const validateMultiple = (value: number) => {
    // avoids NaN and empy values
    if (value < 0)
    {
      const textValue = setQuant(0);
      onSetPrice(parseFloat(textValue.toString()));
    }
    else {
      const textValue = setQuant(value);
      onSetPrice(parseFloat(textValue.toString()));
    }
  };

  const handleDelete = () => {
    onDelete();
    setQuant(0);
  };

  return (
    <Box
      sx={{
        width: { xs: 150, md: 200 },
        textAlign: "right",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          marginBottom: theme.spacing(0.5),
          padding: theme.spacing(0.5, 0.75),
          borderRadius: theme.shape.borderRadius,
          border: `solid 1px ${theme.palette.text.disabled}`,
        }}
      >
        <TextField
          value={quant}
          type="number"
          onChange={(e) => setQuant(e.target.value)}
          onBlur={(e) => validateMultiple(parseFloat(e.target.value))}
          size="small"
          sx={{
            minWidth: 90,
            textAlign: "center",
          }}
          inputProps={{
            inputMode: "decimal",
            style: {
              paddingLeft: theme.spacing(0),
              marginLeft: theme.spacing(-2),
              paddingRight: theme.spacing(0.5),
              textAlign: "center",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$&nbsp;</InputAdornment>
            ),
          }}
        />
      </div>
      <div style={{ marginLeft: theme.spacing(1) }}>
        <IconButton
          size="medium"
          color="primary"
          onClick={handleDelete}
          // Removed because it was causing confusion to delete products from list
          // disabled={priceDetail.price.price === 0}
        >
          <Icon icon={trash2Fill} width={16} height={16} />
        </IconButton>
      </div>
    </Box>
  );
};

// ----------------------------------------------------------------------

type PickSupplierProductPriceSectionProps = {
  priceDetails: Array<PriceListDetailsType>;
  onDelete: (priceDetail: any) => void;
  onSetPrice: (priceDetail: any) => void;
  addPrice: (priceDetail: any) => void;
  title?: string;
};

const PickSupplierProductPriceSection: React.FC<
  PickSupplierProductPriceSectionProps
> = ({ priceDetails, onDelete, title = undefined, onSetPrice, addPrice }) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [addProdModalOpen, setAddProdModalOpen] = useState(false);

  // filter prices
  let filteredPrices = priceDetails.filter((pr) => {
    const productDescription = normalizeText(pr.description);
    return productDescription.includes(normalizeText(search));
  });

  return (
    <React.Fragment>
      {/* add product modal */}
      <AddProductToPriceListModal
        open={addProdModalOpen}
        onClose={() => setAddProdModalOpen(false)}
        onAddToList={addPrice}
        productsInList={priceDetails}
      />
      {/* main card */}
      <Card sx={{ m: 0, width: "100%" }}>
        {title && <CardHeader title={title} />}
        <CardContent sx={{ m: 0, width: "100%" }}>
          <Grid container>
            <Grid
              item
              md={9}
              xs={12}
              sx={{ px: { xs: 0, md: 1 }, mb: { xs: 0, md: 2 } }}
            >
              {/* Search bar */}
              <SearchBar
                placeholder="Busca los productos..."
                searchValue={search}
                searchCallback={setSearch}
                searchResultsLength={filteredPrices.length}
              />
            </Grid>
            <Grid
              item
              md={3}
              xs={12}
              justifyContent={"flex-end"}
              sx={{ pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 1 } }}
            >
              <Button
                fullWidth
                size="small"
                variant={"contained"}
                color={"info"}
                onClick={() => setAddProdModalOpen(true)}
                sx={{ mt: { xs: 1, md: 1 }, mb: { xs: 1, md: 1 } }}
              >
                <React.Fragment>
                  <Icon icon={plusFill} width={20} height={20} />
                  &nbsp; Agregar producto a la lista
                </React.Fragment>
              </Button>
            </Grid>
          </Grid>
          {/* Table of products */}
          <DynamicTableLoader
            appendable
            ContainerType={StyledTableContainer}
            containerSx={{
              minHeight: { xs: 440, md: 540 },
            }}
            elements={filteredPrices}
            headers={
              <TableHead>
                <TableRow>
                  {/* Desktop */}
                  <MHidden width="smDown">
                    <TableCell
                      align="left"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Producto
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Precio
                    </TableCell>
                  </MHidden>
                  {/* Mobile */}
                  <MHidden width="smUp">
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
                      Precio
                    </TableCell>
                  </MHidden>
                </TableRow>
              </TableHead>
            }
            renderMap={(fPrcs) => {
              return fPrcs.map((prx) => {
                const sUnit =
                  Object.entries(UOMTypes).find(
                    (s) => s[0].toUpperCase() === prx.sellUnit.toUpperCase()
                  )?.[1] || prx.sellUnit;
                return (
                  <TableRow key={prx?.sku}>
                    {/* Product Cell */}
                    <TableCell sx={{ minWidth: 180, maxWidth: 210 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box>
                          <Typography variant="subtitle2">
                            {`${prx.description}`}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body1"
                            color="textSecondary"
                            sx={{ fontSize: 12 }}
                          >
                            {`${sUnit},  SKU: ${prx.sku}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {/* Price Cell */}
                    <TableCell align="right">
                      {/* Desktop version */}
                      <MHidden width="smDown">
                        <Grid container>
                          <Grid item xs={0} md={4} />
                          <Grid item xs={12} md={6}>
                            <Box sx={{ ml: 2 }}>
                              <PriceIncrementer
                                priceDetail={prx}
                                onDelete={() => onDelete(prx)}
                                onSetPrice={(pr) =>
                                  onSetPrice({
                                    ...prx,
                                    price: { ...prx.price, price: pr },
                                  })
                                }
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </MHidden>
                      {/* Mobile version */}
                      <MHidden width="smUp">
                        <Grid container>
                          <Grid item xs={12} sx={{ marginTop: 1 }}>
                            <PriceIncrementer
                              priceDetail={prx}
                              onDelete={() => onDelete(prx)}
                              onSetPrice={(pr) =>
                                onSetPrice({
                                  ...prx,
                                  price: { ...prx.price, price: pr },
                                })
                              }
                            />
                          </Grid>
                        </Grid>
                      </MHidden>
                    </TableCell>
                  </TableRow>
                );
              });
            }}
          >
            {priceDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body1" color="textSecondary">
                    Agrega productos a tu lista.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {priceDetails.length > 0 && filteredPrices.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No hay productos que coincidan con la búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </DynamicTableLoader>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default PickSupplierProductPriceSection;
