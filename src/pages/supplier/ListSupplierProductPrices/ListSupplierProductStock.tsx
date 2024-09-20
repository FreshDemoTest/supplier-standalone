import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
// material
import { Box, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { enqueueSnackbar } from "notistack";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import DownloadFill from "@iconify/icons-ic/file-download";
// redux
import {
  clearExportProductStockSuccess,
  exportProductsStockFile,
  getProductStock,
} from "../../../redux/slices/supplier";
// components
import SearchBar from "../../../components/SearchBar";
import FixedAddSupplierProdsPopover, {
  AddSupplierProdsPopover,
} from "../../../components/supplier/AddSupplierProductPopover";
import LoadingProgress from "../../../components/LoadingProgress";
// domain
import { SupplierProductType } from "../../../domain/supplier/SupplierProduct";
// utils
import { mixtrack } from "../../../utils/analytics";
import { createBlobURI, normalizeText } from "../../../utils/helpers";
import { DynamicLoader } from "../../../components/DynamicLoader";
import MHidden from "../../../components/extensions/MHidden";
import SupplierProductStockCardItem from "../../../components/supplier/SupplierProductStockCardItem";
import BasicDialog from "../../../components/navigation/BasicDialog";
import { getSupplierAlimaAccountSaasConfig } from "../../../redux/slices/account";
import { retrieveUISectionDetails } from "../../../utils/permissions";

// ----------------------------------------------------------------------

const searchAndFilter = (
  search: string,
  supplierProds: SupplierProductType[]
) => {
  let filteredSuppliers = [...supplierProds];
  // search
  if (search) {
    filteredSuppliers = filteredSuppliers.filter((sup) => {
      const byName = normalizeText(sup.productDescription).includes(
        normalizeText(search)
      );
      const bySku = normalizeText(sup.sku).includes(normalizeText(search));
      const byCateg =
        sup.productCategory &&
        normalizeText(sup.productCategory).includes(normalizeText(search));
      return byName || byCateg || bySku;
    });
  }
  const activeSupplierProducts = filteredSuppliers.filter(product => product.stock?.active);
  return activeSupplierProducts;
};

// ----------------------------------------------------------------------

const ListSupplierProductsStockView: React.FC<{}> = () => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [filteredSupplierProds, setFilteredSupplierProds] = useState<any>([]);
  const { supplierProdsStock, isLoading } = useAppSelector(
    (state) => state.supplier
  );
  const { activeUnit } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const { exportProductsStock } = useAppSelector((state) => state.supplier);
  const { saasConfig } = useAppSelector((state) => state.account);
  const [errorPlg, setErrorPlg] = useState<boolean>(true);

  // on dispatch ready
  useEffect(() => {
    if (!sessionToken) return;
    if (saasConfig && saasConfig?.config?.sections) return;
    dispatch(getSupplierAlimaAccountSaasConfig(sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  useEffect(() => {
    if (!saasConfig) return;
    const catalogSectionDetails = retrieveUISectionDetails(
      "Catálogo",
      saasConfig
    );
    if (!catalogSectionDetails) {
      setErrorPlg(true);
      return;
    }
    // find plugin
    const plg = catalogSectionDetails.plugins?.find(
      (p) => p.plugin_name === "Inventario"
    );
    if (!plg) {
      setErrorPlg(true);
      return;
    }
    setErrorPlg(false);
  }, [saasConfig]);

  // hook - download file
  useEffect(() => {
    if (exportProductsStock.loaded && exportProductsStock.file) {
      // generate url
      const _blobUrl = createBlobURI(exportProductsStock.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportProductsStock.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportProductStockSuccess());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportProductsStock]);
  // call to download file
  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(exportProductsStockFile(xformat, activeUnit.id, sessionToken || "", ""));
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      mixtrack(`download_pedidos_${xformat}`, {
        visit: window.location.toString(),
        page: "Pedidos",
        section: "SearchBar",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      mixtrack(`error_download_pedidos_${xformat}`, {
        visit: window.location.toString(),
        page: "Pedidos",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // hook to fetch products
  useEffect(() => {
    if (!sessionToken || !activeUnit) return;
    const _getProds = async () => {
      try {
        await dispatch(getProductStock(activeUnit.id, sessionToken || ""));
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Error al cargar productos", {
          variant: "error",
        });
      }
    };
    _getProds();
  }, [dispatch, sessionToken, activeUnit]);

  // search
  const handleSearch = (value: string) => {
    setSearch(value);
    mixtrack("search_supplier_prods", {
      visit: window.location.toString(),
      page: "ListSupplierProducts",
      section: "SearchBar",
      search: value,
    });
  };

  // filtering & searching
  useEffect(() => {
    setFilteredSupplierProds(searchAndFilter(search, supplierProdsStock));
  }, [search, supplierProdsStock]);

  return (
    <>
      {!errorPlg && (
        <Box sx={{ mt: theme.spacing(3) }}>

          <Grid container>
            <Grid item xs={10} md={7}>
              {/* Search bar */}
              <SearchBar
                placeholder="Buscar productos ..."
                searchValue={search}
                searchCallback={handleSearch}
                searchResultsLength={filteredSupplierProds.length}
              />
            </Grid>
            <Grid item xs={0} md={4}>
              {/* Desktop only */}
              <MHidden width="mdDown">
                <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                  <AddSupplierProdsPopover sectionType="stock" />
                </Box>
              </MHidden>
            </Grid>
            <Grid item xs={2} md={1}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  [theme.breakpoints.down("md")]: {
                    justifyContent: "center",
                  },
                }}
              >
                {/* Search bar */}
                <IconButton
                  sx={{
                    visibility:
                      supplierProdsStock.length > 0 ? "visible" : "hidden",
                  }}
                  onClick={() => {
                    setOpenDownloadDiag(true);
                  }}
                >
                  <Icon icon={DownloadFill} width={28} height={28} />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* List of  product catalog */}
          {isLoading && <LoadingProgress sx={{ mt: 3 }} />}
          {!isLoading && (
            <DynamicLoader
              elements={filteredSupplierProds}
              containerSx={{ mt: 4, minHeight: { xs: 540, md: 800 } }}
              scrollIncrement={20}
              headers={
                <>
                  {supplierProdsStock.length === 0 && !isLoading && (
                    <Box sx={{ my: theme.spacing(3) }}>
                      <Typography variant="h6" align="center">
                        No hay productos dados de alta.
                      </Typography>
                    </Box>
                  )}
                </>
              }
              renderMap={(filtSProds) => {
                return filtSProds.map((sup) => (
                  <Box key={sup.id} sx={{ mb: theme.spacing(2) }}>
                    <SupplierProductStockCardItem
                      supplierProduct={sup}

                    />
                  </Box>
                ));
              }}
            />
          )}
          <BasicDialog
            closeMark
            open={openDownloadDiag}
            onClose={() => setOpenDownloadDiag(false)}
            title={"Descargar Productos"}
            msg={"Selecciona el formato de descarga de tu productos"}
            continueAction={{
              active: true,
              msg: "Excel (XLSX)",
              actionFn: () => handleDownloadExport("xlsx"),
            }}
            backAction={{
              active: true,
              msg: "CSV",
              actionFn: () => handleDownloadExport("csv"),
            }}
          >
            {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
          </BasicDialog>
          {/* Mobile - Fixed add supplier product button */}
          <MHidden width="mdUp">
            <FixedAddSupplierProdsPopover sectionType="stock" />
          </MHidden>

        </Box>
      )}
    </>
  );
};

export default ListSupplierProductsStockView;
