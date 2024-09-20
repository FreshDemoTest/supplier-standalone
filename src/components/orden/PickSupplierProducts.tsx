import React, { useState, useEffect, Fragment } from "react";
import Decimal from "decimal.js";
// components
import { Icon } from "@iconify/react";
import plusFill from "@iconify/icons-eva/plus-fill";
import minusFill from "@iconify/icons-eva/minus-fill";
import trash2Fill from "@iconify/icons-eva/trash-2-fill";
import arrowDownSFill from "@iconify/icons-eva/arrow-down-fill";
import arrowUpSFill from "@iconify/icons-eva/arrow-up-outline";
import {
  Box,
  Grid,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  debounce,
  IconButton,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Button,
  Chip,
} from "@mui/material";
// redux
import {
  clearSupplierProducts
} from "../../redux/slices/orden";
// hooks
import { useAppDispatch } from "../../redux/store";
// components
import MHidden from "../extensions/MHidden";
import SearchBar from "../SearchBar";
// utils
import {
  computeCartTotals,
  fCurrency,
  normalizeText,
} from "../../utils/helpers";
// domain
import { CartProductType } from "../../domain/orden/Orden";
import { UOMTypes } from "../../domain/supplier/SupplierProduct";
import { SummaryRow } from "../../styles/tables/ordenTable";
import { DynamicTableLoader } from "../DynamicLoader";

// ----------------------------------------------------------------------

// const getImgFam = (width: number, pkey: string) =>
//   `${BASE_IMG}w_${width}/v1623758141/alima-web/families/${pkey}.png`;

// ----------------------------------------------------------------------

type IncrementerProps = {
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
  product: CartProductType;
  onChange: (product: any, value: number | string) => void;
  changeMaxQuantity: string | undefined;
  setChangeMaxQuantity: (value: string | undefined) => void;
};

const Incrementer: React.FC<IncrementerProps> = ({
  onIncrease,
  onDecrease,
  onDelete,
  product,
  onChange,
  changeMaxQuantity,
  setChangeMaxQuantity,
}) => {
  const theme = useTheme();
  const [quant, _setQuant] = useState<number | string>(
    product.quantity * (product.supplierProduct?.unitMultiple || 1)
  );

  const setQuant = (value: number | string) => {
    if (typeof value === "string") {
      _setQuant(value);
      return;
    } else {
      if (value.toString() === "NaN") {
        _setQuant(0);
        onDelete();
        return;
      }
      if (value <= 0) {
        onDelete();
        _setQuant(0);
        return;
      }
      const _val = new Decimal(value).toDecimalPlaces(3).toNumber();
      _setQuant(_val);
    }
  };

  useEffect(() => {
    setQuant(product.quantity * (product.supplierProduct?.unitMultiple || 1));
    if (changeMaxQuantity && product.supplierProduct.id === changeMaxQuantity) {
      setQuant(product.quantity);
      setChangeMaxQuantity(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.quantity, product.supplierProduct.unitMultiple, changeMaxQuantity]);

  const validateMultiple = (value: number) => {
    /**
     * validates rounding to nearest unit_multiple
     * debounces to take final quantities
     */
    setQuant(value);
    // avoids NaN and empy values
    const textValue = Math.round(
      value / (product.supplierProduct?.unitMultiple || 1)
    );

    debounce(() => {
      const dataVal =
        Math.round(value / (product.supplierProduct?.unitMultiple || 1)) *
        (product.supplierProduct?.unitMultiple || 1);
      setQuant(dataVal);
      onChange(product, textValue);
      // dispatch(updateProductQuantity({ ...product, quantity: textValue }));
    }, 500)();
  };

  const incQuantity = () => {
    onIncrease();
    if (product.quantity === 0) {
      setQuant(1);
      return;
    }
    setQuant(product.quantity * (product.supplierProduct?.unitMultiple || 1));
  };

  const decQuantity = () => {
    onDecrease();
    setQuant(product.quantity * (product.supplierProduct?.unitMultiple || 1));
  };

  const handleDelete = () => {
    onDelete();
    setQuant(0);
  };

  return (
    <Box sx={{ width: 130, textAlign: "right" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(0.5),
          padding: theme.spacing(0.5, 0.75),
          borderRadius: theme.shape.borderRadius,
          border: `solid 1px ${theme.palette.text.disabled}`,
        }}
      >
        {product.quantity !== product.supplierProduct.minimumQuantity ? (
          <IconButton
            size="small"
            color="inherit"
            onClick={decQuantity}
            disabled={product.quantity <= 1}
          >
            <Icon icon={minusFill} width={16} height={16} />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            color="primary"
            onClick={handleDelete}
            disabled={product.quantity !== 1}
          >
            <Icon icon={trash2Fill} width={16} height={16} />
          </IconButton>
        )}

        <TextField
          value={quant}
          type="number"
          // onChange={(e) => validateMultiple(parseFloat(e.target.value))}
          onChange={(e) => setQuant(e.target.value)}
          onBlur={(e) => validateMultiple(parseFloat(e.target.value))}
          size="small"
          sx={{ minWidth: 60 }}
          inputProps={{
            inputMode: "decimal",
            pattern: "[0-9]*",
            style: { paddingLeft: 0, paddingRight: 0, textAlign: "center" },
          }}
        />

        <IconButton size="small" color="inherit" onClick={incQuantity}>
          <Icon icon={plusFill} width={16} height={16} />
        </IconButton>
      </div>
    </Box>
  );
};

// ----------------------------------------------------------------------

type PickSupplierProductsSectionProps = {
  products: Array<CartProductType>;
  onDelete: (product: any) => void;
  onDecreaseQuantity: (product: any) => void;
  onIncreaseQuantity: (product: any) => void;
  title?: string;
  minReached: { flag: boolean; amountStr: string };
  sortValsDefault?: boolean;
  onChangeQuantity: (product: any, value: string | number) => void;
  changeMaxQuantity: string | undefined;
  setChangeMaxQuantity: (value: string | undefined) => void;
};

const PickSupplierProductsSection: React.FC<
  PickSupplierProductsSectionProps
> = ({
  products,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  title = undefined,
  minReached,
  sortValsDefault = false,
  onChangeQuantity,
  changeMaxQuantity,
  setChangeMaxQuantity,
}) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState("");
    const [sortVals, setSortVals] = useState(sortValsDefault);
    const [subtotal, setSubtotal] = useState<number | undefined>(undefined);

    // hook - update subtotal
    useEffect(() => {
      const _subt = computeCartTotals(products);
      setSubtotal(_subt.subtotal);
    }, [products]);

    useEffect(() => {
      return () => {
        dispatch(clearSupplierProducts());
      };
    }, [dispatch]);

    function roundStockAvailability(availability: number): number {
      const roundedValue = Math.round(availability * 1000) / 1000;
      const strValue = roundedValue.toString();
      
      // Remove unnecessary trailing zeros
      return parseFloat(strValue);
  }

    // filter products
    let filteredProducts = sortVals
      ? products
        .filter((product) => {
          const productDescription = normalizeText(
            product.supplierProduct.productDescription
          );
          return productDescription.includes(normalizeText(search));
        })
        .filter((a) => {
          return a.quantity > 0;
        })
      : products.filter((product) => {
        const productDescription = normalizeText(
          product.supplierProduct.productDescription
        );
        return productDescription.includes(normalizeText(search));
      });

    const sortProductsByQuantity = () => {
      setSortVals(!sortVals);
    };

    return (
      <React.Fragment>
        <Typography
          variant="h6"
          sx={{ ml: 1, mb: 1, mt: 2 }}
          color="text.secondary"
          align="left"
        >
          Selecciona los productos
        </Typography>
        <Card sx={{ m: 0, width: "100%" }}>
          {title && <CardHeader title={title || "Selecciona productos"} />}
          <CardContent sx={{ m: 0, width: "100%" }}>
            {/* Summary of products */}
            {/* Button that calls the sort products by quantity function */}
            <Grid container>
              <Grid
                item
                md={products.length > 0 ? 9 : 12}
                xs={12}
                sx={{ px: { xs: 0, md: 1 } }}
              >
                {/* Search bar */}
                <SearchBar
                  placeholder="Res, Jitomate, Almendras, ..."
                  searchValue={search}
                  searchCallback={setSearch}
                  searchResultsLength={filteredProducts.length}
                />
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
                justifyContent={"flex-end"}
                sx={{ pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 1 } }}
              >
                {products.length > 0 && (
                  <Button
                    fullWidth
                    size="small"
                    variant={!sortVals ? "outlined" : "contained"}
                    color={!sortVals ? "primary" : "info"}
                    onClick={sortProductsByQuantity}
                    sx={{ mt: { xs: 1, md: 1 }, mb: { xs: 1, md: 1 } }}
                  >
                    {!sortVals && (
                      <React.Fragment>
                        <Icon icon={arrowUpSFill} width={20} height={20} />
                        &nbsp;Ver Resumen
                      </React.Fragment>
                    )}
                    {sortVals && (
                      <React.Fragment>
                        <Icon icon={arrowDownSFill} width={20} height={20} />
                        Ver Todos
                      </React.Fragment>
                    )}
                  </Button>
                )}
              </Grid>
            </Grid>
            {/* Table of products */}
            <DynamicTableLoader
              elements={filteredProducts}
              containerSx={{
                minHeight: { xs: 400, md: 400 },
              }}
              headers={
                <TableHead>
                  <TableRow>
                    <MHidden width="smDown">
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Producto
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Cantidad
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Precio
                      </TableCell>
                    </MHidden>
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
                        Cantidad
                      </TableCell>
                    </MHidden>
                  </TableRow>
                </TableHead>
              }
              renderMap={(filteredProducts) => {
                return filteredProducts.map((product) => {
                  // [TODO] - implementing in next release
                  // const cover = {
                  //   thumb: getImgFam(
                  //     64,
                  //     (product?.supplierProduct?.id || '')
                  //       .replaceAll('_', '-')
                  //       .toLowerCase()
                  //   )
                  // };
                  const sUnit =
                    Object.entries(UOMTypes).find(
                      (s) =>
                        s[0].toUpperCase() ===
                        product.supplierProduct.sellUnit.toUpperCase()
                    )?.[1] || product.supplierProduct.sellUnit;
                  return (
                    <TableRow key={product?.supplierProduct?.id}>
                      {/* Product Cell */}
                      <TableCell sx={{ minWidth: 180, maxWidth: 210 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            component="img"
                            alt="imagen producto"
                            data-src="/static/assets/alima/alima-leaf.jpg"
                            // src={cover.thumb}
                            className="lazyload blur-up"
                            sx={{
                              mr: 2,
                              width: 48,
                              height: 48,
                              borderRadius: 1.5,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">
                              {product.supplierProduct.productDescription}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body1"
                              color="textSecondary"
                              sx={{ fontSize: 12 }}
                            >
                              {`${fCurrency(product.price?.amount)} / ${sUnit}`}
                            </Typography>
                            <br /> {/* Adds a line break */}
                            {product.supplierProduct.stock?.active === true &&
                              product.supplierProduct.stock?.amount -
                              product.quantity * product.supplierProduct.unitMultiple <=
                              product.supplierProduct.minQuantity ? (
                              <Chip
                                key={product.id}
                                label={
                                  <>
                                    <b>{`${
                                      (product.supplierProduct.stock?.amount - product.quantity * product.supplierProduct.unitMultiple) < 0 
                                        ? `Faltantes: ${roundStockAvailability((product.supplierProduct.stock?.amount - product.quantity * product.supplierProduct.unitMultiple)*-1)} (${sUnit})`
                                        : `Disponible: ${roundStockAvailability(product.supplierProduct.stock?.amount - product.quantity * product.supplierProduct.unitMultiple)} (${sUnit})`
                                    }`}</b>
                                  </>
                                }
                                sx={{ mt: 0.5 }}
                                size="small"
                                variant="outlined"
                                // change color to red
                                color={
                                  product.quantity * product.supplierProduct.unitMultiple - product.supplierProduct.stock?.amount >= 0
                                    ? "error"
                                    : "warning"
                                }
                              />
                            ) : null}
                          </Box>
                        </Box>
                      </TableCell>
                      {/* Quantity Cell */}
                      <TableCell align="right">
                        {/* Desktop version */}
                        <MHidden width="smDown">
                          <Grid container>
                            <Grid item xs={12}>
                              <Incrementer
                                product={product}
                                onDelete={() => onDelete(product)}
                                onDecrease={() => onDecreaseQuantity(product)}
                                onIncrease={() => onIncreaseQuantity(product)}
                                onChange={onChangeQuantity}
                                changeMaxQuantity={changeMaxQuantity}
                                setChangeMaxQuantity={setChangeMaxQuantity}
                              />
                            </Grid>
                            {/* <Grid item xs={12}>
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => onDelete(product)}
                          >
                            Eliminar
                          </Link>
                        </Grid> */}
                          </Grid>
                        </MHidden>
                        {/* Mobile version */}
                        <MHidden width="smUp">
                          <Grid container>
                            <Grid item xs={12}>
                              <Typography variant="body1" color="primary">
                                <b>
                                  {fCurrency(
                                    product.quantity *
                                    (product.supplierProduct?.unitMultiple ||
                                      1) *
                                    (product?.price?.amount || 0)
                                  )}{" "}
                                  MXN
                                </b>
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sx={{ marginTop: 1 }}>
                              <Incrementer
                                product={product}
                                onDelete={() => onDelete(product)}
                                onDecrease={() => onDecreaseQuantity(product)}
                                onIncrease={() => onIncreaseQuantity(product)}
                                onChange={onChangeQuantity}
                                changeMaxQuantity={changeMaxQuantity}
                                setChangeMaxQuantity={setChangeMaxQuantity}
                              />
                            </Grid>
                          </Grid>
                        </MHidden>
                      </TableCell>

                      {/* Price Cell */}
                      <MHidden width="smDown">
                        <TableCell align="right">
                          {fCurrency(
                            product.quantity *
                            (product.supplierProduct?.unitMultiple || 1) *
                            (product?.price?.amount || 0)
                          )}
                        </TableCell>
                      </MHidden>
                    </TableRow>
                  );
                });
              }}
            >
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" color="textSecondary">
                      Selecciona un cliente para ver sus productos y precios
                      correspondientes.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {products.length > 0 && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No hay productos que coincidan con la búsqueda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {/* Subtotal */}
              <Fragment>
                <MHidden width="smDown">
                  {/* Desktop */}
                  <SummaryRow
                    sx={{
                      fontSize: theme.typography.subtitle1,
                      color: theme.palette.text.secondary,
                      fontWeight: theme.typography.fontWeightMedium,
                    }}
                    label="Subtotal"
                    value={subtotal}
                    colSpan={1}
                    contentColSpan={1}
                  />
                </MHidden>
                <MHidden width="smUp">
                  <TableRow>
                    <TableCell align="center">
                      <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        fontWeight={theme.typography.fontWeightMedium}
                      >
                        Subtotal
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        fontWeight={theme.typography.fontWeightMedium}
                      >
                        {fCurrency(subtotal)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </MHidden>
              </Fragment>
            </DynamicTableLoader>

            {!minReached.flag && products.length > 0 && (
              <>
                <MHidden width="mdDown">
                  {/* Desktop */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Tu pedido no llega al mínimo: {minReached.amountStr}
                  </Alert>
                </MHidden>
                <MHidden width="mdUp">
                  {/* mobile */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Tu pedido no llega al mínimo: <br /> {minReached.amountStr}
                  </Alert>
                </MHidden>
              </>
            )}
          </CardContent>
        </Card>
      </React.Fragment>
    );
  };

export default PickSupplierProductsSection;
