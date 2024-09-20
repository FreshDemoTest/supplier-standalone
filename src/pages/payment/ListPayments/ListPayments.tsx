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
  Pagination,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import PlusFill from "@iconify/icons-ic/add";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useLocation, useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
// components
import { SearchBarOnClick } from "../../../components/SearchBar";
import DateFilterPopover from "../../../components/DateFilterPopover";
import BasicDialog from "../../../components/navigation/BasicDialog";
import LoadingProgress from "../../../components/LoadingProgress";
import { DynamicLoader } from "../../../components/DynamicLoader";
import PaymentReceiptCardItem from "../../../components/payment/PaymentReceiptCardItem";
import MHidden from "../../../components/extensions/MHidden";
// domain
import { PaymentReceiptType } from "../../../domain/orden/Orden";
import { ClientBranchType } from "../../../domain/client/Client";
// redux
import {
  clearActivePagos,
  setActivePagosDateRange,
  setActivePagosFilters,
  exportActivePagosFile,
  clearExportActivePagos,
  getPagosByRange,
} from "../../../redux/slices/orden";
import { getActiveClients } from "../../../redux/slices/client";
// utils
import { createBlobURI, fISODate } from "../../../utils/helpers";
import { mixtrack } from "../../../utils/analytics";
import { PATH_APP } from "../../../routes/paths";

// ----------------------------------------------------------------------

const searchAndFilter = (
  filters: any,
  pagos: PaymentReceiptType[],
  clients: ClientBranchType[]
) => {
  // let filteredFacts = pagos.map((o) => {
  //   const client = clients.find((c) => c.id === o?.client?.id);
  //   if (client) return { ...o, client: client };
  //   return o;
  // });
  // // search
  // if (search) {
  //   const _srch = normalizeText(search);
  //   filteredFacts = filteredFacts.filter((fact) => {
  //     const byId = normalizeText(fact?.id || "").includes(_srch);
  //     const byName = normalizeText(fact?.client?.branchName || "").includes(
  //       _srch
  //     );
  //     return byId || byName;
  //   });
  // }
  // // filters
  // if (filters) {
  //   if (filters.status.length > 0) {
  //     filteredFacts = filteredFacts.filter((fact) => {
  //       return (
  //         fact.status &&
  //         filters.status.includes(decodePaymentStatusTypes(fact.status) || "")
  //       );
  //     });
  //   }
  //   if (filters.client.length > 0) {
  //     filteredFacts = filteredFacts.filter((fact) => {
  //       return (
  //         fact.client?.branchName &&
  //         filters.client.includes(fact.client?.branchName)
  //       );
  //     });
  //   }
  // }

  return pagos as PaymentReceiptType[];
};

// ----------------------------------------------------------------------

type ListPaymentsViewProps = {
  search?: string;
  pageNum?: number;
};

const ListPaymentsView: React.FC<ListPaymentsViewProps> = ({
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
  const [filteredPagos, setFilteredPagos] = useState<PaymentReceiptType[]>([]);
  const {
    activePagos,
    activePagosFilters,
    exportActivePagos,
    isLoading: isPagoLoading,
  } = useAppSelector((state) => state.orden);
  const { activeUnit, units } = useAppSelector((state) => state.account);
  const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const activeUnits = units.filter((u: any) => !u.deleted);
  const [searchString, setSearchString] = useState(search);

  // fetch historic
  useEffect(() => {
    // implement pagination
    if (!sessionToken) return;
    if (!activeUnit?.id) return;
    dispatch(
      getPagosByRange(activeUnit, sessionToken, dateRange, search, pageNum)
    );
    const activeUnitIds = activeUnits.map((u: any) => u.id);
    dispatch(getActiveClients(activeUnitIds, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, dateRange, sessionToken, activeUnit]);

  // hook - onchange filters
  useEffect(() => {
    setSelectedFilters({
      status: activePagosFilters.status,
      client: activePagosFilters.client,
    });
    setDateRange(activePagosFilters.dateRange);
    // call to fetch data
    if (!activeUnit?.id) return;
    dispatch(
      getPagosByRange(
        activeUnit,
        sessionToken || "",
        dateRange,
        search,
        pageNum
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activePagosFilters, search]);

  // hook on change page
  useEffect(() => {
    if (!activeUnit?.id) return;
    dispatch(
      getPagosByRange(
        activeUnit,
        sessionToken || "",
        dateRange,
        search,
        pageNum
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageNum]);

  // filters - [TODO]
  // const filterOptions: any[] = [
  //   {
  //     label: "Estátus",
  //     key: "status",
  //     options: activePagos
  //       .map((inv: PaymentReceiptType) => decodeInvoiceStatusTypes(inv?.status || ""))
  //       .filter((v: any) => v)
  //       .reduce((a: any, b: any) => (a.includes(b) ? a : [...a, b]), []),
  //   },
  // ];

  // date range
  const handleDateFilters = (filts: any) => {
    dispatch(setActivePagosDateRange(filts));
    mixtrack("filter_dates_active_pagos", {
      visit: window.location.toString(),
      page: "Pagos",
      section: "SearchBar",
      filters: filts,
    });
  };

  // search
  const _handleSearch = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("search", value);
    searchParams.set("page", "1");
    navigate({
      search: searchParams.toString(),
    });
    mixtrack("search_active_pagos", {
      visit: window.location.toString(),
      page: "Pagos",
      section: "SearchBar",
      search: value,
    });
  };

  const handleSearch = (value: string) => {
    setSearchString(value);
    // if value contains enter then redirect
    if (value.includes("\n")) {
      _handleSearch(value.replace("\n", ""));
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
      setActivePagosFilters({
        ...filts,
        search: search,
        dateRange: dateRange,
      })
    );
    mixtrack("filter_active_pagos", {
      visit: window.location.toString(),
      page: "Pagos",
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
      dispatch(clearActivePagos());
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
        exportActivePagosFile(
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
      mixtrack(`download_historic_pagos_${xformat}`, {
        visit: window.location.toString(),
        page: "Pagos",
        section: "SearchBar",
      });
    } catch (err: any) {
      console.warn(err);
      enqueueSnackbar(`Error al descargar archivo ${xformat.toUpperCase()}`, {
        variant: "error",
        autoHideDuration: 2000,
      });
      mixtrack(`error_download_historic_pagos_${xformat}`, {
        visit: window.location.toString(),
        page: "Pagos",
        section: "SearchBar",
        error: err.toString(),
      });
    }
    setOpenDownloadDiag(false);
  };

  // hook - download file
  useEffect(() => {
    if (exportActivePagos.loaded && exportActivePagos.file) {
      // generate url
      const _blobUrl = createBlobURI(exportActivePagos.file);
      // assign to temp anchor element
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = _blobUrl;
      a.download = exportActivePagos.file.name;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(_blobUrl);
        document.body.removeChild(a);
      }, 0);
      dispatch(clearExportActivePagos());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportActivePagos]);

  // filtering & searching
  useEffect(() => {
    setFilteredPagos(
      searchAndFilter(selectedFilters, activePagos, activeClients)
    );
  }, [search, selectedFilters, activePagos, activeClients]);

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
        title={"Descargar Reporte de Pagos"}
        msg={"Selecciona el formato de descarga de tu historial de pagos."}
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
        {isPagoLoading && <LoadingProgress sx={{ mt: 2 }} />}
      </BasicDialog>
      {/* Search bar */}
      <Grid container>
        <Grid item xs={11} md={11}>
          <SearchBarOnClick
            placeholder="Buscar pagos"
            searchValue={searchString}
            searchCallback={handleSearch}
            searchResultsLength={filteredPagos.length}
            // filterComponent={
            //   <FiltersPopover
            //     filterOptions={filterOptions}
            //     filtersState={selectedFilters}
            //     action={handleFilters}
            //   />
            // }
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
              visibility: filteredPagos.length === 0 ? "hidden" : "visible",
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
                navigate(PATH_APP.payment.add);
                mixtrack("add_payment_click", {
                  visit: window.location.toString(),
                  section: "SearchBar",
                  page: "AddPayment",
                });
              }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.secondary,
                boxShadow: theme.shadows[2],
                px: theme.spacing(2),
              }}
            >
              Agregar Pago
            </Button>
          </Box>
        </MHidden>
      </Grid>

      {/* List of historic orders */}
      {isPagoLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {!isPagoLoading && (
        <>
          <DynamicLoader
            elements={filteredPagos}
            containerSx={{ mt: 4, minHeight: { xs: 540 * 2, md: 800 } }}
            headers={
              <>
                {filteringChips.length > 0 &&
                  filteredPagos.length === 0 &&
                  activePagos.length > 0 &&
                  !isPagoLoading && (
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
                {!isPagoLoading && activePagos.length === 0 && (
                  <Box sx={{ my: theme.spacing(3) }}>
                    <Typography variant="h5" align="center">
                      No hay pagos en estas fechas.
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
            renderMap={(fPagos) => {
              return fPagos.map((receipt) => (
                <Box key={receipt.id} sx={{ mb: theme.spacing(2) }}>
                  <PaymentReceiptCardItem receipt={receipt} />
                </Box>
              ));
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {activePagos.length > 0 && (
              <Pagination
                variant="outlined"
                shape="circular"
                count={activePagos.length % 10 === 0 ? pageNum + 1 : pageNum}
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

export default ListPaymentsView;
