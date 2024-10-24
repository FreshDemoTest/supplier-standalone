import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
// material
import DownloadFill from "@iconify/icons-ic/file-download";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import PlusFill from "@iconify/icons-ic/add";
import CancelFill from "@iconify/icons-ic/cancel";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";
// components
import SearchBar from "../../../components/SearchBar";
import FiltersPopover from "../../../components/FiltersPopover";
import DateFilterPopover from "../../../components/DateFilterPopover";
import OrdenCardItem from "../../../components/orden/OrdenCardItem";
import BasicDialog from "../../../components/navigation/BasicDialog";
import LoadingProgress from "../../../components/LoadingProgress";
import { DynamicLoader } from "../../../components/DynamicLoader";
import MHidden from "../../../components/extensions/MHidden";
// domain
import {
  OrdenType,
  decodeOrdenPayStatusTypes,
  decodeOrdenStatusTypes,
} from "../../../domain/orden/Orden";
import { ClientBranchType, ClientPOCType } from "../../../domain/client/Client";
// redux
import {
  clearActiveOrdenes,
  setActiveOrdenesDateRange,
  setActiveOrdenesFilters,
  setActiveOrdenes,
  setActiveOrdenesSearch,
  exportActiveOrdenesFile,
  clearExportActiveOrdenes,
} from "../../../redux/slices/orden";
import { getActiveClients } from "../../../redux/slices/client";
// utils
import { createBlobURI, fISODate, normalizeText } from "../../../utils/helpers";
import track from "../../../utils/analytics";
import { PATH_APP } from "../../../routes/paths";

// ----------------------------------------------------------------------

const searchAndFilter = (
  search: string,
  filters: any,
  ordenes: OrdenType[],
  clients: (ClientBranchType & ClientPOCType & { fullAddress?: string })[]
) => {
  let filteredOrdenes = ordenes
    .map((o) => {
      const client = clients.find((c) => c.id === o.restaurantBranch.id);
      if (client) return { ...o, restaurantBranch: client };
      return o;
    })
    .sort((a, b) => {
      if (!a.deliveryDate || !b.deliveryDate) return 0;
      return b.deliveryDate < a.deliveryDate ? 1 : -1;
    });
  // search
  if (search) {
    const normedSearch = normalizeText(search);
    filteredOrdenes = filteredOrdenes.filter((orden) => {
      const byId = orden.id && normalizeText(orden.id).includes(normedSearch);
      const byName =
        orden.restaurantBranch &&
        normalizeText(orden.restaurantBranch.branchName).includes(normedSearch);
      const byBiz =
        orden.restaurantBranch?.displayName &&
        normalizeText(orden.restaurantBranch.displayName).includes(
          normedSearch
        );
      const byOrdNum =
        orden.ordenNumber && orden.ordenNumber.includes(normedSearch);
      return byId || byName || byBiz || byOrdNum;
    });
  }
  // filters
  if (filters) {
    if (filters.status.length > 0) {
      filteredOrdenes = filteredOrdenes.filter((orden) => {
        return (
          orden.status &&
          filters.status.includes(decodeOrdenStatusTypes(orden.status) || "")
        );
      });
    }
    if (filters.paystatus.length > 0) {
      filteredOrdenes = filteredOrdenes.filter((orden) => {
        return (
          orden.paystatus &&
          filters.paystatus.includes(
            decodeOrdenPayStatusTypes(orden.paystatus) || ""
          )
        );
      });
    }
    if (filters.client.length > 0) {
      filteredOrdenes = filteredOrdenes.filter((orden) => {
        return (
          orden.restaurantBranch?.branchName &&
          filters.client.includes(orden.restaurantBranch?.branchName)
        );
      });
    }
  }

  return filteredOrdenes as OrdenType[];
};

// ----------------------------------------------------------------------

const ListSalesOrdenesView: React.FC<{}> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    status: [],
    paystatus: [],
    client: [],
  });
  const [dateRange, setDateRange] = useState<any>({
    start: null,
    end: null,
  });
  const {
    activeOrdenes,
    activeFilters,
    exportActiveOrdenes,
    invoiceDetails,
    ordenDetails,
    isLoading: isOrdenLoading,
  } = useAppSelector((state) => state.orden);
  const { activeUnit, units } = useAppSelector((state) => state.account);
  const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const activeUnits = units.filter((u: any) => !u.deleted);

  // fetch historic
  useEffect(() => {
    // [TODO] implement pagination
    if (!sessionToken) return;
    if (!dateRange.start || !dateRange.end) return;
    if (!activeUnit?.id) return;
    dispatch(setActiveOrdenes(activeUnit, dateRange, sessionToken));
    const activeUnitIds = activeUnits.map((u: any) => u.id);
    dispatch(getActiveClients(activeUnitIds, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    dateRange,
    sessionToken,
    activeUnit,
    invoiceDetails,
    ordenDetails,
  ]);

  // effects
  useEffect(() => {
    setSearch(activeFilters.search);
    setSelectedFilters({
      status: activeFilters.status,
      client: activeFilters.client,
      paystatus: activeFilters.paystatus,
    });
    setDateRange(activeFilters.dateRange);
  }, [dispatch, activeFilters]);

  // filters
  const filterOptions = [
    {
      label: "Estátus de Entrega",
      key: "status",
      options: activeOrdenes
        .map((orden: any) => decodeOrdenStatusTypes(orden.status))
        .filter((v: any) => v)
        .reduce((a: any, b: any) => (a.includes(b) ? a : [...a, b]), []),
    },
    {
      label: "Estátus de Pago",
      key: "paystatus",
      options: activeOrdenes
        .map((orden: any) => decodeOrdenPayStatusTypes(orden.paystatus))
        .filter((v: any) => v)
        .reduce((a: any, b: any) => (a.includes(b) ? a : [...a, b]), []),
    },
  ];

  // date range
  const handleDateFilters = (filts: any) => {
    dispatch(setActiveOrdenesDateRange(filts));
    track("select_content", {
      visit: window.location.toString(),
      page: "Ordenes",
      section: "SearchBar",
      filters: filts,
    });
  };

  // search
  const handleSearch = (value: string) => {
    dispatch(setActiveOrdenesSearch(value));
    track("search", {
      visit: window.location.toString(),
      page: "Ordenes",
      section: "SearchBar",
      search: value,
    });
  };

  // filter
  const handleFilters = (filts: any) => {
    dispatch(
      setActiveOrdenesFilters({
        ...filts,
        search: search,
        dateRange: dateRange,
      })
    );
    track("select_content", {
      visit: window.location.toString(),
      page: "Ordenes",
      section: "SearchBar",
      filters: filts,
    });
  };

  //  on delete filter
  const onDeleteFilter = (filt: { k: string; v: string }) => {
    const filterName = filt.k;
    const filterValue = filt.v;
    const newFilters = { ...selectedFilters };
    if (filterName === "dateRange") {
      handleDateFilters({ start: null, end: null });
      dispatch(clearActiveOrdenes());
    } else {
      const newFilterValues = newFilters[filterName].filter(
        (v: any) => v !== filterValue
      );
      newFilters[filterName] = newFilterValues;
      handleFilters(newFilters);
    }
  };

  // call to download file
  const handleDownloadExport = async (xformat: string) => {
    try {
      await dispatch(
        exportActiveOrdenesFile(
          xformat,
          activeUnit,
          dateRange,
          sessionToken || ""
        )
      );
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      track("view_item_list", {
        visit: window.location.toString(),
        page: "Ordenes",
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
        page: "Ordenes",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // hook - download file
  useEffect(() => {
    if (exportActiveOrdenes.loaded && exportActiveOrdenes.file) {
      // generate url
      const _blobUrl = createBlobURI(exportActiveOrdenes.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportActiveOrdenes.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportActiveOrdenes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportActiveOrdenes]);

  // filtering & searching
  const filteredOrdenes = searchAndFilter(
    search,
    selectedFilters,
    activeOrdenes,
    activeClients
  );

  // filtering chips
  const filteringChips =
    (
      selectedFilters.status.map((val: any) => ({
        m: `Estátus: ${val}`,
        c: { k: "status", v: val },
      })) || []
    )
      .concat(
        selectedFilters.paystatus.map((val: any) => ({
          m: `Pago: ${val}`,
          c: { k: "paystatus", v: val },
        })) || []
      )
      .concat(
        selectedFilters.client.map((val: any) => ({
          m: `Cliente: ${val}`,
          c: { k: "client", v: val },
        })) || []
      )
      .concat(
        dateRange.start && dateRange.end
          ? [
              {
                m: `Fechas: ${fISODate(dateRange.start)} <> ${fISODate(
                  dateRange.end
                )}`,
                c: { k: "dateRange", v: dateRange },
              },
            ]
          : []
      ) || [];

  // chip color
  const chipColorSelect = (key: string, val?: string) => {
    if (key === "dateRange") {
      return theme.palette.primary.dark;
    } else if (key === "status") {
      if (val === "Entregado") return theme.palette.primary.main;
      if (val === "Cancelado") return theme.palette.error.main;
      return theme.palette.info.main;
    } else if (key === "paystatus") {
      if (val === "Pagado") return theme.palette.success.main;
      if (val === "Sin Pagar") return theme.palette.error.main;
      return theme.palette.info.main;
    }
    return theme.palette.secondary.main;
  };

  return (
    <Box>
      {/* Extension download Confimation */}
      <BasicDialog
        closeMark
        open={openDownloadDiag}
        onClose={() => setOpenDownloadDiag(false)}
        title={"Descargar Reporte de Pedidos"}
        msg={"Selecciona el formato de descarga de tu historial de pedidos."}
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
        {isOrdenLoading && <LoadingProgress sx={{ mt: 2 }} />}
      </BasicDialog>
      {/* Search bar */}
      <Grid container>
        <Grid item xs={11} md={11}>
          <SearchBar
            placeholder="Buscar pedidos"
            searchValue={search}
            searchCallback={handleSearch}
            searchResultsLength={filteredOrdenes.length}
            filterComponent={
              <FiltersPopover
                filterOptions={filterOptions}
                filtersState={selectedFilters}
                action={handleFilters}
              />
            }
            dateFilterComponent={
              <DateFilterPopover
                action={handleDateFilters}
                dateFilterState={dateRange}
              />
            }
          />
        </Grid>
        <Grid item xs={1} md={1}>
          <IconButton
            sx={{
              mt: theme.spacing(0.5),
              visibility: filteredOrdenes.length === 0 ? "hidden" : "visible",
            }}
            onClick={() => {
              setOpenDownloadDiag(true);
            }}
          >
            <Icon icon={DownloadFill} width={24} height={24} />
          </IconButton>
        </Grid>
      </Grid>

      {/* Filter badges */}
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box sx={{ flexDirection: "row" }}>
            {filteringChips.map((c: { m: string; c: any }) => (
              <Chip
                key={c.m}
                label={c.m}
                variant="outlined"
                sx={{
                  mt: theme.spacing(1),
                  mx: theme.spacing(1),
                  px: theme.spacing(2),
                  backgroundColor: chipColorSelect(c.c.k, c.c.v),
                  color: theme.palette.common.white,
                  fontWeight: "bold",
                }}
                deleteIcon={
                  <Icon
                    icon={CancelFill}
                    width={24}
                    height={24}
                    style={{
                      color: theme.palette.common.white,
                    }}
                  />
                }
                onDelete={() => {
                  onDeleteFilter(c.c);
                }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          {/* Desktop only */}
          <MHidden width="mdDown">
            <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
              <Button
                size="medium"
                startIcon={
                  <Icon
                    icon={PlusFill}
                    width={24}
                    height={24}
                    color={theme.palette.text.secondary}
                  />
                }
                onClick={() => {
                  navigate(PATH_APP.orden.add);
                  track("select_content", {
                    visit: window.location.toString(),
                    section: "SearchBar",
                    page: "ListActiveOrdenes",
                  });
                }}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.text.secondary,
                  boxShadow: theme.shadows[2],
                  px: theme.spacing(2),
                }}
              >
                Agregar Pedido
              </Button>
            </Box>
          </MHidden>
        </Grid>
      </Grid>

      {/* List of historic orders */}
      {isOrdenLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isOrdenLoading && (
        <DynamicLoader
          elements={filteredOrdenes}
          containerSx={{ mt: 4, minHeight: { xs: 540, md: 800 } }}
          headers={
            <>
              {filteringChips.length > 0 &&
                filteredOrdenes.length === 0 &&
                activeOrdenes.length > 0 &&
                !isOrdenLoading && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: theme.spacing(2) }}
                  >
                    No hay resultados con estos filtros.
                  </Typography>
                )}

              {/* Message of empty historic orders */}
              {!isOrdenLoading && activeOrdenes.length === 0 && (
                <Box sx={{ my: theme.spacing(3) }}>
                  <Typography variant="h5" align="center">
                    {filteringChips.length === 0
                      ? `No hay ninguna fecha seleccionada.`
                      : `No hay pedidos en estas fechas.`}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color={"text.secondary"}
                  >
                    {filteringChips.length === 0
                      ? `Selecciona el rango de fechas de los pedidos que quieres ver.`
                      : `Intenta otro rango de fechas y/o otros filtros.`}
                  </Typography>
                </Box>
              )}
            </>
          }
          renderMap={(fOrds) => {
            return fOrds.map((orden) => (
              <Box key={orden.id} sx={{ mb: theme.spacing(2) }}>
                <OrdenCardItem orden={orden} />
              </Box>
            ));
          }}
        />
      )}
    </Box>
  );
};

export default ListSalesOrdenesView;
