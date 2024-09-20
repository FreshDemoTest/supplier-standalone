import React, { useState, useEffect } from "react";
// components
import { Icon } from "@iconify/react";
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
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Button,
  styled,
  FormControlLabel,
  Checkbox,
  Radio,
} from "@mui/material";
// redux
// hooks
// components
import MHidden from "../extensions/MHidden";
import SearchBar from "../SearchBar";
// utils
import { normalizeText, roundDownToNearestMultiple } from "../../utils/helpers";
// domain
import { SupplierProductType, UOMTypes } from "../../domain/supplier/SupplierProduct";
import { DynamicTableLoaderWithCheckBox } from "../DynamicLoader";
import AddProductToStockListModal from "./AddProductToStockListModal";

// ----------------------------------------------------------------------

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  minWidth: 280,
}));

// ----------------------------------------------------------------------

type StockIncrementerProps = {
  onSetStock: (pr: number) => void;
  stockDetail: SupplierProductType;
  sUnit: string;
};

const StockIncrementer: React.FC<StockIncrementerProps> = ({
  onSetStock,
  stockDetail,
  sUnit
}) => {
  const theme = useTheme();
  const [quant, _setQuant] = useState<number | string>(stockDetail.stock ? stockDetail.stock.availability ? stockDetail.stock.availability : 0 : 0);

  const setQuant = (value: number | string) => {
    if (typeof value === "string") {
      _setQuant(value);
      return value;
    } else {
      if (value.toString() === "NaN") {
        _setQuant(0);
        return value;
      }
      const textValue = roundDownToNearestMultiple(value, stockDetail.unitMultiple || 1);
      _setQuant(textValue);
      return value;
    }
  };

  useEffect(() => {
    if (!stockDetail.stock) {
      return;
    }
    setQuant(stockDetail.stock.availability || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockDetail.stock?.availability]);

  const validateMultiple = (value: number) => {
    // avoids NaN and empy values
    const textValue = setQuant(value);
    onSetStock(parseFloat(textValue.toString()));
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
          disabled={!stockDetail.stock?.active}
          size="small"
          sx={{
            minWidth: 90,
            textAlign: "center",
          }}
          inputProps={{
            inputMode: "decimal",
            style: {
              paddingLeft: theme.spacing(0),
              marginLeft: theme.spacing(0),
              paddingRight: theme.spacing(0),
              textAlign: "center",
            },
          }}
          InputProps={{
            endAdornment: (
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ fontSize: 12 }}>
                {sUnit}
              </Typography>
            )
          }}
        />
      </div>
    </Box>
  );
};

// ----------------------------------------------------------------------

type PickSupplierProductStockSectionProps = {
  stockDetails: Array<SupplierProductType>;
  onSetStock: (stockDetails: any) => void;
  addStock: (stockDetails: any) => void;
  title?: string;
};

const PickSupplierProductStockSection: React.FC<
  PickSupplierProductStockSectionProps
> = ({ stockDetails, title = undefined, onSetStock, addStock }) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [addProdModalOpen, setAddProdModalOpen] = useState(false);
  const [filteredstock, setFilteredstock] = useState<SupplierProductType[]>(stockDetails);

  useEffect(() => {
    const filteredstocklist = stockDetails.filter((pr) => {
      const productDescription = normalizeText(pr.productDescription);
      return productDescription.includes(normalizeText(search));
    });
    setFilteredstock(filteredstocklist);
  }, [stockDetails, search]);

  return (
    <React.Fragment>
      {/* add product modal */}
      <AddProductToStockListModal
        open={addProdModalOpen}
        onClose={() => setAddProdModalOpen(false)}
        onAddToList={addStock}
        productsInList={stockDetails}
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
                searchResultsLength={filteredstock.length}
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
          <DynamicTableLoaderWithCheckBox
            appendable
            ContainerType={StyledTableContainer}
            containerSx={{
              minHeight: { xs: 440, md: 540 },
            }}
            elements={filteredstock}
            headers={
              <TableHead>
                <TableRow>
                  {/* Desktop */}
                  <MHidden width="smDown">
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Habilitar
                    </TableCell>
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
                      Inventario
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Vender sin inventario
                    </TableCell>
                  </MHidden>
                  {/* Mobile */}
                  <MHidden width="smUp">
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Habilitar
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
                      Inventario
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.disabled }}
                    >
                      Vender sin inventario
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
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: 'center', alignItems: "center" }}>
                        <Box>

                          <Checkbox
                            // value={prx.stock?.active}
                            checked={prx.stock?.active}
                            onChange={(pr) => {
                              onSetStock({
                                ...prx,
                                stock: { ...prx.stock, active: pr.target.checked },
                              })
                            }}
                            name="activeCheckBox"
                          />

                        </Box>
                      </Box>
                    </TableCell>
                    {/* Product Cell */}
                    <TableCell sx={{ minWidth: 180, maxWidth: 210 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color={prx.stock.active ? "text.primary" : "text.disabled"}>
                            {`${prx.productDescription}`}
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
                    <TableCell align="center">
                      {/* Desktop version */}
                      <MHidden width="smDown">
                        <Grid container>
                          <Grid item xs={0} md={4} />
                          <Grid item xs={12} md={6}>
                            <Box sx={{ ml: 2 }}>
                              <StockIncrementer
                                stockDetail={prx}
                                onSetStock={(pr) =>
                                  onSetStock({
                                    ...prx,
                                    stock: { ...prx.stock, availability: roundDownToNearestMultiple(pr, prx.unitMultiple || 1) },
                                  })
                                }
                                sUnit={sUnit}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </MHidden>
                      {/* Mobile version */}
                      <MHidden width="smUp">
                        <Grid container>
                          <Grid item xs={12} sx={{ marginTop: 1 }}>
                            <StockIncrementer
                              stockDetail={prx}
                              onSetStock={(pr) =>
                                onSetStock({
                                  ...prx,
                                  stock: { ...prx.stock, availability: roundDownToNearestMultiple(pr, prx.unitMultiple || 1) },
                                })
                              }
                              sUnit={sUnit}
                            />
                          </Grid>
                        </Grid>
                      </MHidden>
                    </TableCell>

                    <TableCell sx={{ minWidth: 40, maxWidth: 210 }}>
                      <Box sx={{ display: "flex", justifyContent: 'center', alignItems: "center" }}>
                        <Box>
                          <FormControlLabel
                            control={
                              <Radio
                                disabled={!prx.stock?.active}
                                checked={prx.stock?.keepSellingWithoutStock}
                                value={prx.stock?.keepSellingWithoutStock}
                                onClick={(pr) =>
                                  onSetStock({
                                    ...prx,
                                    stock: { ...prx.stock, keepSellingWithoutStock: !prx.stock.keepSellingWithoutStock },
                                  })}
                                name="keepSellingWithoutStockCheckBox"
                              />
                            }
                            label=""
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              });
            }}
          >
            {stockDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" color="textSecondary">
                    Agrega productos a tu lista.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {stockDetails.length > 0 && filteredstock.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No hay productos que coincidan con la búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </DynamicTableLoaderWithCheckBox>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default PickSupplierProductStockSection;
