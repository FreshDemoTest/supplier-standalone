import { useEffect, useState } from "react";
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
  clearExportAllPriceListSuccess,
  exportAllPriceListFile,
  getPriceLists,
} from "../../../redux/slices/supplier";
// components
import SearchBar from "../../../components/SearchBar";
import FixedAddSupplierProdsPopover, {
  AddSupplierProdsPopover,
} from "../../../components/supplier/AddSupplierProductPopover";
import LoadingProgress from "../../../components/LoadingProgress";
import SupplierPriceListCardItem from "../../../components/supplier/SupplierPriceListCardItem";
import MHidden from "../../../components/extensions/MHidden";
// utils
import { mixtrack } from "../../../utils/analytics";
// domain
import { SupplierPriceListType } from "../../../domain/supplier/SupplierPriceList";
import { PATH_APP } from "../../../routes/paths";
import { createBlobURI } from "../../../utils/helpers";
import BasicDialog from "../../../components/navigation/BasicDialog";

// ----------------------------------------------------------------------

const searchAndFilter = (
  search: string,
  filters: any,
  pricesLists: SupplierPriceListType[]
) => {
  let filteredPLs = pricesLists;
  // [TODO]
  // search
  if (search) {
    filteredPLs = filteredPLs.filter((pl) => {
      return pl.listName.toLowerCase().includes(search.toLowerCase());
    });
  }
  // filters
  if (filters) {
    // [TODO]
  }

  return filteredPLs;
};

// ----------------------------------------------------------------------

const ListSupplierPricesListsView: React.FC<{}> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionToken } = useAuth();
  const { activeUnit } = useAppSelector((state) => state.account);
  const { supplierPricesLists, isLoading } = useAppSelector(
    (state) => state.supplier
  );
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const { exportAllPriceList } = useAppSelector((state) => state.supplier);

  // hook - download file
  useEffect(() => {
    if (exportAllPriceList.loaded && exportAllPriceList.file) {
      // generate url
      const _blobUrl = createBlobURI(exportAllPriceList.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportAllPriceList.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportAllPriceListSuccess());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportAllPriceList]);

  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(
        exportAllPriceListFile(xformat, activeUnit.id || "", sessionToken || "")
      );
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      mixtrack(`download_listas _de_precios_${xformat}`, {
        visit: window.location.toString(),
        page: "Prices",
        section: "SearchBar",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      mixtrack(`error_download_listas_de_precios_${xformat}`, {
        visit: window.location.toString(),
        page: "Prices",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // hook to fetch products
  useEffect(() => {
    if (!sessionToken || !activeUnit) return;
    const _getPriceLists = async () => {
      try {
        await dispatch(getPriceLists(activeUnit.id, sessionToken));
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Error al cargar tus listas de precios", {
          variant: "error",
        });
      }
    };
    _getPriceLists();
  }, [dispatch, sessionToken, activeUnit]);

  // search
  const handleSearch = (value: string) => {
    setSearch(value);
    mixtrack("search_supplier_prices_list", {
      visit: window.location.toString(),
      page: "ListSupplierPricesLists",
      section: "SearchBar",
      search: value,
    });
  };

  // filtering & searching
  const filteredPrLists = searchAndFilter(search, {}, supplierPricesLists);

  return (
    <Box sx={{ mt: theme.spacing(3) }}>
      {/* Search bar */}
      <Grid container>
        <Grid item xs={10} md={7}>
          <SearchBar
            placeholder="Buscar listas de precio"
            searchValue={search}
            searchCallback={handleSearch}
            searchResultsLength={filteredPrLists.length}
          />
        </Grid>
        <Grid item xs={0} md={4}>
          {/* Desktop only */}
          <MHidden width="mdDown">
            <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
              <AddSupplierProdsPopover sectionType="prices" />
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
                  supplierPricesLists.length > 0 ? "visible" : "hidden",
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

      {/* Message of empty prices lists */}
      {supplierPricesLists.length === 0 && !isLoading && (
        <Box sx={{ my: theme.spacing(3) }}>
          <Typography variant="h5" align="center">
            No hay listas de precio dadas de alta.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: theme.spacing(3) }} />
      <BasicDialog
        closeMark
        open={openDownloadDiag}
        onClose={() => setOpenDownloadDiag(false)}
        title={"Descarga todos los precios actuales"}
        msg={"Selecciona el formato de descarga de tus listas de precios"}
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
      ></BasicDialog>
      {/* List of price lists */}
      {isLoading && <LoadingProgress />}
      {!isLoading &&
        filteredPrLists.map((pl) => (
          <Box key={pl.id} sx={{ mb: theme.spacing(2) }}>
            <SupplierPriceListCardItem
              priceList={pl}
              onClick={() => {
                mixtrack("click_supplier_price_list", {
                  visit: window.location.toString(),
                  page: "ListSupplierPricesLists",
                  section: "PriceListCardItem",
                  priceListId: pl.id,
                });
                navigate(
                  PATH_APP.catalog.price.listDetails.replace(
                    ":priceListId",
                    pl.id || ""
                  )
                );
              }}
            />
          </Box>
        ))}

      {/* Mobile - Fixed add supplier prices button */}
      <MHidden width="mdUp">
        <FixedAddSupplierProdsPopover sectionType="prices" />
      </MHidden>
    </Box>
  );
};

export default ListSupplierPricesListsView;
