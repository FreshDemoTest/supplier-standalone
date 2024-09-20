import React, { useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
// material
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Cached from "@mui/icons-material/Cached";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { enqueueSnackbar } from "notistack";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// redux
import { getProductCatalog } from "../../redux/slices/supplier";
// components
import LoadingProgress from "../LoadingProgress";
import SearchBar from "../SearchBar";
// domain
import {
  SupplierProductType,
  UOMTypes,
} from "../../domain/supplier/SupplierProduct";
// utils
import { normalizeText } from "../../utils/helpers";
import { PATH_APP } from "../../routes/paths";
import { DynamicTableLoader } from "../DynamicLoader";
import MHidden from "../extensions/MHidden";

interface AddProductToStockListModalProps {
  open: boolean;
  onClose: () => void;
  onAddToList: (pr: SupplierProductType) => void;
  productsInList: SupplierProductType[];
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: 400,
  minHeight: 480,
  overflow: "auto",
  [theme.breakpoints.down("md")]: {
    minHeight: 540,
    width: 300,
  },
}));

const AddProductToStockListModal: React.FC<AddProductToStockListModalProps> = ({
  open,
  onClose,
  onAddToList,
  productsInList,
}) => {
  const { sessionToken } = useAuth();
  const fetchedSps = useRef(false);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { supplierProdsCatalog, isLoading } = useAppSelector(
    (state) => state.supplier
  );
  const [products, setProducts] = React.useState<SupplierProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<
    SupplierProductType[]
  >([]);
  const [prodsIdx, setProdsIdx] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState<string>("");

  const debouncedSearch = (srch: string) => {
    setSearch(srch);
  };

  // hook to fetch products
  useEffect(() => {
    if (!sessionToken || fetchedSps.current) return;
    const _getProds = async () => {
      try {
        await dispatch(getProductCatalog(sessionToken || ""));
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Error al cargar productos", {
          variant: "error",
        });
      }
    };
    _getProds();
    fetchedSps.current = true;
  }, [dispatch, sessionToken]);

  // hook to render products
  useEffect(() => {
    setProducts(supplierProdsCatalog);
  }, [supplierProdsCatalog]);

  // hook to create prods in list idx
  useEffect(() => {
    setProdsIdx(
      productsInList
        .filter((p) => p.sku !== undefined)
        .map((p) => p.sku as string)
    );
  }, [productsInList]);

  // hook to filter products
  useEffect(() => {
    if (search.length < 1) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((sup) => {
      const byName = normalizeText(sup.productDescription).includes(
        normalizeText(search)
      );
      const byUnit = normalizeText(sup.sellUnit).includes(
        normalizeText(search)
      );
      return byName || byUnit;
    });
    setFilteredProducts(filtered);
  }, [products, search]);

  // handle manual reload catalog
  const handleReloadCatalog = () => {
    dispatch(getProductCatalog(sessionToken || ""));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="addproduct-to-pricelist-dialog"
      aria-describedby="addproduct-to-pricelist-dialog-description"
    >
      <DialogTitle id="addproduct-to-pricelist-dialog">
        Agrega Producto a la Lista
      </DialogTitle>
      <DialogContent>
        {/* Search bar */}
        <Box
          sx={{
            pt: 0,
            pb: 1,
            position: "absolute",
            width: "100%",
            backgroundColor: theme.palette.common.white,
            zIndex: 100,
          }}
        >
          <Box
            sx={{
              mt: 1,
              width: 300,
            }}
          >
            <Grid container>
              <Grid item xs={10} md={11} sx={{ pr: 1 }}>
                <SearchBar
                  placeholder="Filtra tus productos ..."
                  searchValue={search}
                  searchCallback={debouncedSearch}
                  searchResultsLength={filteredProducts.length}
                />
              </Grid>
              <Grid item xs={2} md={1}>
                {/* Desktop */}
                <MHidden width="mdDown">
                  <Button
                    sx={{ mt: 1, color: theme.palette.text.disabled }}
                    onClick={handleReloadCatalog}
                  >
                    Actualizar&nbsp;
                    <Cached color="disabled" sx={{ width: 18, height: 18 }} />
                  </Button>
                </MHidden>

                {/* Mobile */}
                <MHidden width="mdUp">
                  <IconButton
                    sx={{ mt: 1, ml: 1, color: theme.palette.text.disabled }}
                    onClick={handleReloadCatalog}
                  >
                    <Cached color="disabled" />
                  </IconButton>
                </MHidden>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box sx={{ mt: 12 }}>
          {isLoading && (
            <LoadingProgress
              sx={{
                minHeight: { xs: 540, md: 600 },
                minWidth: 340,
                py: 20,
              }}
            />
          )}
          {!isLoading && (
            <DynamicTableLoader
              ContainerType={StyledTableContainer}
              elements={filteredProducts}
              headers={
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: theme.palette.text.disabled }}>
                      Producto
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.disabled }}
                      align="right"
                    ></TableCell>
                  </TableRow>
                </TableHead>
              }
              renderMap={(fProds) => {
                return fProds.map((product) => {
                  const sUnit =
                    Object.entries(UOMTypes).find(
                      (s) =>
                        s[0].toUpperCase() === product.sellUnit.toUpperCase()
                    )?.[1] || product.sellUnit;
                  const isProductInList = prodsIdx.includes(
                    product.sku as string
                  );
                  return (
                    <TableRow key={product.id}>
                      <TableCell sx={{ minWidth: 180, maxWidth: 210 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {product.productDescription}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body1"
                              color="textSecondary"
                              sx={{ fontSize: 12 }}
                            >
                              {sUnit}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {!isProductInList && (
                          <Button
                            variant="contained"
                            color="info"
                            onClick={() => {
                              onAddToList({
                                id: product.id,
                                sku: product.sku,
                                productDescription: product.productDescription,
                                sellUnit: product.sellUnit,
                                stock: {
                                    uuid: "",
                                    amount: 0,
                                    unit: product.sellUnit,
                                    keepSellingWithoutStock: false,
                                    active: true,
                                },
                              } as SupplierProductType);
                            }}
                          >
                            Agregar
                          </Button>
                        )}
                        {isProductInList && (
                          <IconButton disabled>
                            <CheckIcon color="primary" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                });
              }}
            >
              {filteredProducts.length < 1 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body1">
                      No se encontraron productos.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </DynamicTableLoader>
          )}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1">
              ¿El producto no está dado de alta?
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <Link
                component={RouterLink}
                to={PATH_APP.catalog.product.add}
                target="_blank"
                rel="noopener"
              >
                Agregar a Catálogo <OpenInNew fontSize="inherit" />
              </Link>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button sx={{ mr: 2, my: 1 }} onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductToStockListModal;
