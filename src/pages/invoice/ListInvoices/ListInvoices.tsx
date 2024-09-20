import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
// material
import DownloadFill from "@iconify/icons-ic/file-download";
import {
  Box,
  Chip,
  Grid,
  Button,
  IconButton,
  Pagination,
  Typography,
  useTheme,
} from "@mui/material";
import PlusFill from "@iconify/icons-ic/add";
import { Icon } from "@iconify/react";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router";
// components
import { SearchBarOnClick } from "../../../components/SearchBar";
import FiltersPopover from "../../../components/FiltersPopover";
import DateFilterPopover from "../../../components/DateFilterPopover";
import BasicDialog from "../../../components/navigation/BasicDialog";
import LoadingProgress from "../../../components/LoadingProgress";
import { DynamicLoader } from "../../../components/DynamicLoader";
import InvoiceCardItem from "../../../components/invoice/InvoiceCardItem";
import MHidden from "../../../components/extensions/MHidden";
// domain
import {
  InvoiceType,
  decodeInvoiceStatusTypes,
} from "../../../domain/orden/Orden";
import { ClientBranchType } from "../../../domain/client/Client";
// redux
import {
  clearActiveFacturas,
  setActiveFacturasDateRange,
  setActiveFacturasFilters,
  exportActiveFacturasFile,
  clearExportActiveFacturas,
  getFacturasByRange,
} from "../../../redux/slices/orden";
import { getActiveClients } from "../../../redux/slices/client";
// utils
import { createBlobURI, fISODate } from "../../../utils/helpers";
import { mixtrack } from "../../../utils/analytics";
import { PATH_APP } from "../../../routes/paths";

// ----------------------------------------------------------------------

const searchAndFilter = (
  filters: any,
  facturas: InvoiceType[],
  clients: ClientBranchType[]
) => {
  let filteredFacts = facturas.map((o) => {
    const client = clients.find((c) => c.id === o?.client?.id);
    if (client) return { ...o, client: client };
    return o;
  });
  // filters
  if (filters) {
    if (filters.status.length > 0) {
      filteredFacts = filteredFacts.filter((fact) => {
        return (
          fact.status &&
          filters.status.includes(decodeInvoiceStatusTypes(fact.status) || "")
        );
      });
    }
    if (filters.client.length > 0) {
      filteredFacts = filteredFacts.filter((fact) => {
        return (
          fact.client?.branchName &&
          filters.client.includes(fact.client?.branchName)
        );
      });
    }
  }

  return filteredFacts as InvoiceType[];
};

// ----------------------------------------------------------------------

type ListInvoicesViewProps = {
  search?: string;
  pageNum?: number;
};

const ListInvoicesView: React.FC<ListInvoicesViewProps> = ({
  search = "",
  pageNum = 1,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionToken } = useAuth();
  const [openDownloadDiag, setOpenDownloadDiag] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    status: [],
    client: [],
  });
  const [dateRange, setDateRange] = useState<any>({
    start: null,
    end: null,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filteredFacturas, setFilteredFacturas] = useState<InvoiceType[]>([]);
  const {
    activeFacturas,
    activeFacturasFilters,
    exportActiveFacturas,
    isLoading: isFacturaLoading,
  } = useAppSelector((state) => state.orden);
  const { activeUnit, units } = useAppSelector((state) => state.account);
  const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const activeUnits = units.filter((u: any) => !u.deleted);
  const [searchString, setSearchString] = useState(search);
  // [TODO] - We need to figure out how to keep track of the ongoing requests, 
  // to cancel one in case another one of the same endpoint is called (ie.e getFacturasByRange)

  // fetch historic
  useEffect(() => {
    // [TODO] implement pagination
    if (!sessionToken) return;
    if (!activeUnit?.id) return;
    dispatch(
      getFacturasByRange(activeUnit, sessionToken, dateRange, search, pageNum)
    );
    const activeUnitIds = activeUnits.map((u: any) => u.id);
    dispatch(getActiveClients(activeUnitIds, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, dateRange, sessionToken, activeUnit]);

  // hook - onchange filters
  useEffect(() => {
    setSelectedFilters({
      status: activeFacturasFilters.status,
      client: activeFacturasFilters.client,
    });
    setDateRange(activeFacturasFilters.dateRange);
    // call to fetch data
    if (!activeUnit?.id) return;
    dispatch(
      getFacturasByRange(
        activeUnit,
        sessionToken || "",
        activeFacturasFilters.dateRange,
        search,
        pageNum
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeFacturasFilters, search]);

  // hook on change page
  useEffect(() => {
    if (!activeUnit?.id) return;
    dispatch(
      getFacturasByRange(
        activeUnit,
        sessionToken || "",
        dateRange,
        search,
        pageNum
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageNum]);

  // hook - download file
  useEffect(() => {
    if (exportActiveFacturas.loaded && exportActiveFacturas.file) {
      // generate url
      const _blobUrl = createBlobURI(exportActiveFacturas.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportActiveFacturas.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportActiveFacturas());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportActiveFacturas]);

  // hook - filtering & searching
  useEffect(() => {
    setFilteredFacturas(
      searchAndFilter(selectedFilters, activeFacturas, activeClients)
    );
  }, [search, selectedFilters, activeFacturas, activeClients]);

  // date range
  const handleDateFilters = (filts: any) => {
    dispatch(setActiveFacturasDateRange(filts));
    mixtrack("filter_dates_active_facturas", {
      visit: window.location.toString(),
      page: "Facturas",
      section: "SearchBar",
      filters: filts,
    });
  };

  // search
  const redirectSearch = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("search", value);
    searchParams.set("page", "1");
    navigate({
      search: searchParams.toString(),
    });
    mixtrack("search_active_facturas", {
      visit: window.location.toString(),
      page: "Facturas",
      section: "SearchBar",
      search: value,
    });
  };

  const handleSearch = (value: string) => {
    setSearchString(value);
    // if value contains enter then redirect
    if (value.includes("\n")) {
      redirectSearch(value.replace("\n", ""));
    }
  };

  // pagination
  const handlePageNum = (event: any, value: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("search", search);
    searchParams.set("page", value.toString());
    navigate({
      search: searchParams.toString(),
    });
  };

  // filter
  const handleFilters = (filts: any) => {
    dispatch(
      setActiveFacturasFilters({
        ...filts,
        search: search,
        dateRange: dateRange,
      })
    );
    mixtrack("filter_active_facturas", {
      visit: window.location.toString(),
      page: "Facturas",
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
      dispatch(clearActiveFacturas());
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
        exportActiveFacturasFile(
          xformat,
          activeUnit,
          dateRange,
          sessionToken || "",
          search
        )
      );
      enqueueSnackbar(`Descargando archivo ${xformat.toUpperCase()}...`, {
        variant: "success",
        autoHideDuration: 2000,
      });
      mixtrack(`download_historic_facturas_${xformat}`, {
        visit: window.location.toString(),
        page: "Facturas",
        section: "SearchBar",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      mixtrack(`error_download_historic_facturas_${xformat}`, {
        visit: window.location.toString(),
        page: "Facturas",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // filters
  const filterOptions = [
    {
      label: "Estátus",
      key: "status",
      options: activeFacturas
        .map((inv: InvoiceType) => decodeInvoiceStatusTypes(inv?.status || ""))
        .filter((v: any) => v)
        .reduce((a: any, b: any) => (a.includes(b) ? a : [...a, b]), []),
    },
  ];

  // filtering chips
  const filteringChips =
    (
      selectedFilters.status.map((val: any) => ({
        m: `Estátus: ${val}`,
        c: { k: "status", v: val },
      })) || []
    ).concat(
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

  return (
    <Box>
      {/* Extension download Confimation */}
      <BasicDialog
        closeMark
        open={openDownloadDiag}
        onClose={() => setOpenDownloadDiag(false)}
        title={"Descargar Reporte de Facturas"}
        msg={"Selecciona el formato de descarga de tu historial de facturas."}
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
        {isFacturaLoading && <LoadingProgress sx={{ mt: 2 }} />}
      </BasicDialog>
      {/* Search bar */}
      <Grid container>
        <Grid item xs={11} md={11}>
          <SearchBarOnClick
            placeholder="Buscar facturas"
            searchValue={searchString}
            searchCallback={handleSearch}
            searchResultsLength={filteredFacturas.length}
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
              visibility: filteredFacturas.length === 0 ? "hidden" : "visible",
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
      <Box sx={{ flexDirection: "row" }}>
        {filteringChips.map((c: { m: string; c: any }) => (
          <Chip
            key={c.m}
            label={c.m}
            sx={{
              mt: theme.spacing(1),
              mx: theme.spacing(1),
              px: theme.spacing(2),
              backgroundColor: theme.palette.grey.A400,
              color: theme.palette.common.white,
              fontWeight: "bold",
            }}
            onDelete={() => {
              onDeleteFilter(c.c);
            }}
          />
        ))}
      </Box>
      <Grid item xs={10} md={23}>
        {/* Desktop only */}
        <MHidden width="mdDown">
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
            <Button
              variant="contained"
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
                navigate(PATH_APP.invoice.add);
                mixtrack("add_invoice_click", {
                  visit: window.location.toString(),
                  section: "SearchBar",
                  page: "AddInvoice",
                });
              }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.secondary,
                boxShadow: theme.shadows[2],
                px: theme.spacing(2),
              }}
            >
              Agregar Factura
            </Button>
          </Box>
        </MHidden>
      </Grid>

      {/* List of historic orders */}
      {isFacturaLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isFacturaLoading && (
        <>
          <DynamicLoader
            elements={filteredFacturas}
            containerSx={{ mt: 4, minHeight: { xs: 540 * 2, md: 800 } }}
            headers={
              <>
                {filteringChips.length > 0 &&
                  filteredFacturas.length === 0 &&
                  activeFacturas.length > 0 &&
                  !isFacturaLoading && (
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
                {!isFacturaLoading && activeFacturas.length === 0 && (
                  <Box sx={{ my: theme.spacing(3) }}>
                    <Typography variant="h5" align="center">
                      No hay facturas en estas fechas.
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      color={"text.secondary"}
                    >
                      Intenta otro rango de fechas y/o otros filtros.
                    </Typography>
                  </Box>
                )}
              </>
            }
            renderMap={(fInvs) => {
              // group by invoice id
              const groupedInvs = fInvs.reduce((acc: any[], inv: any) => {
                const id = inv.id;
                const inAccIdx = acc.findIndex((i: any) => i.id === id);
                if (inAccIdx === -1) {
                  acc.push({
                    ...inv,
                    relOrdenIds: [inv.associatedOrdenId],
                  });
                } else {
                  acc[inAccIdx].relOrdenIds.push(inv.associatedOrdenId);
                }
                return acc;
              }, []) as (InvoiceType & { relOrdenIds: string[] })[];
              return groupedInvs.map((invoice) => (
                <Box key={invoice.id} sx={{ mb: theme.spacing(2) }}>
                  <InvoiceCardItem invoice={invoice} />
                </Box>
              ));
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {activeFacturas.length > 0 && (
              <Pagination
                variant="outlined"
                shape="circular"
                count={activeFacturas.length % 10 === 0 ? pageNum + 1 : pageNum}
                page={pageNum}
                onChange={handlePageNum}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ListInvoicesView;
