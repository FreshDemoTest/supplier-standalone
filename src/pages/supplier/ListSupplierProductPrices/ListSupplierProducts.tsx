import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
// material
import { Box, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { enqueueSnackbar } from "notistack";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";
import DownloadFill from "@iconify/icons-ic/file-download";
// redux
import {
  clearExportProductsSuccess,
  exportProductsFile,
  getProductCatalog,
} from "../../../redux/slices/supplier";
// components
import SearchBar from "../../../components/SearchBar";
import SupplierProductCardItem from "../../../components/supplier/SupplierProductCardItem";
import FixedAddSupplierProdsPopover, {
  AddSupplierProdsPopover,
} from "../../../components/supplier/AddSupplierProductPopover";
import LoadingProgress from "../../../components/LoadingProgress";
// domain
import { SupplierProductType } from "../../../domain/supplier/SupplierProduct";
// utils
import track from "../../../utils/analytics";
import { createBlobURI, normalizeText } from "../../../utils/helpers";
import { PATH_APP } from "../../../routes/paths";
import { DynamicLoader } from "../../../components/DynamicLoader";
import MHidden from "../../../components/extensions/MHidden";
import BasicDialog from "../../../components/navigation/BasicDialog";

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
  return filteredSuppliers;
};

// ----------------------------------------------------------------------

const ListSupplierProductsView: React.FC<{}> = () => {
  const theme = useTheme();
  const fetchedSps = useRef(false);
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [filteredSupplierProds, setFilteredSupplierProds] = useState<any>([]);
  const { supplierProdsCatalog, isLoading } = useAppSelector(
    (state) => state.supplier
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const { exportProducts } = useAppSelector((state) => state.supplier);

  // hook - download file
  useEffect(() => {
    if (exportProducts.loaded && exportProducts.file) {
      // generate url
      const _blobUrl = createBlobURI(exportProducts.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportProducts.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportProductsSuccess());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportProducts]);

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

  // filtering & searching
  useEffect(() => {
    setFilteredSupplierProds(searchAndFilter(search, supplierProdsCatalog));
  }, [search, supplierProdsCatalog]);

  // call to download file
  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(exportProductsFile(xformat, sessionToken || "", ""));
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      track("view_item_list", {
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
      track("exception", {
        visit: window.location.toString(),
        page: "Pedidos",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // search
  const handleSearch = (value: string) => {
    setSearch(value);
    track("view_search_results", {
      visit: window.location.toString(),
      page: "ListSupplierProducts",
      section: "SearchBar",
      search: value,
    });
  };

  return (
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
              <AddSupplierProdsPopover sectionType="products" />
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
                  supplierProdsCatalog.length > 0 ? "visible" : "hidden",
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

      {/* Message of empty catalog */}
      {/* {supplierProdsCatalog.length === 0 && !isLoading && (
        <Box sx={{ my: theme.spacing(3) }}>
          <Typography variant="h6" align="center">
            No hay productos dados de alta.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: theme.spacing(3) }} /> */}

      {/* List of  product catalog */}
      {isLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isLoading && (
        <DynamicLoader
          elements={filteredSupplierProds}
          containerSx={{ mt: 4, minHeight: { xs: 540, md: 800 } }}
          scrollIncrement={20}
          headers={
            <>
              {supplierProdsCatalog.length === 0 && !isLoading && (
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
                <SupplierProductCardItem
                  supplierProduct={sup}
                  onClick={() => {
                    if (sup.id) {
                      navigate(
                        PATH_APP.catalog.product.edit.replace(
                          ":productId",
                          sup.id
                        )
                      );
                    }
                  }}
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
        <FixedAddSupplierProdsPopover sectionType="products" />
      </MHidden>
    </Box>
  );
};

export default ListSupplierProductsView;
