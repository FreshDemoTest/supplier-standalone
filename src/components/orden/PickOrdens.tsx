import React, { useState, useEffect } from "react";

import {
  Box,
  Grid,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  TableBody,
  Table,
} from "@mui/material";

// redux
import {
  clearActiveOrdenes,
  setActiveOrdenes,
  setActiveOrdenesDateRange,
  setActiveOrdenesFilters,
} from "../../redux/slices/orden";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// components
import MHidden from "../extensions/MHidden";
import SearchBar from "../SearchBar";
// utils
import {
  fCurrency,
  fISODate,
  inXTime,
  normalizeText,
} from "../../utils/helpers";
import track from "../../utils/analytics";
// domain
import {
  decodeOrdenStatusTypes,
  InvoiceType,
  ordenStatusTypes,
  OrdenType,
  paymentMethods,
  paymentMethodType,
  paymentStatusTypes,
} from "../../domain/orden/Orden";
import {
  ClientBranchType,
  ClientPOCType,
  ClientProfileType,
} from "../../domain/client/Client";
// compoenents
import { SummaryRow } from "../../styles/tables/ordenTable";
import { DynamicTableLoader } from "../DynamicLoader";
import FiltersPopover from "../FiltersPopover";
import DateFilterPopover from "../DateFilterPopover";
import { paystatusChip, statusChip } from "../../styles/mappings";
// paths
import { SupplierProductType } from "../../domain/supplier/SupplierProduct";
import LoadingProgress from "../LoadingProgress";
import { Link } from "react-router-dom";

type CustomOrdenCheckboxProps = {
  orden: OrdenType;
  selected: boolean;
  onCheckboxChange: (orden: OrdenType) => void;
};

const CustomOrdenCheckbox: React.FC<CustomOrdenCheckboxProps> = ({
  orden,
  selected,
  onCheckboxChange,
}) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckboxChange(orden);
  };

  return <Checkbox checked={selected} onChange={handleCheckboxChange} />;
};

const searchAndFilter = (
  search: string,
  filters: any,
  ordenes: Array<OrdenType & { invoice?: InvoiceType }>,
  clients: (ClientBranchType & ClientPOCType & { fullAddress?: string })[],
  clientToOrden?: ClientProfileType & { products: SupplierProductType[] }
) => {
  let filteredOrdenes: Array<OrdenType & { invoice?: InvoiceType }> = ordenes
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
  const nonInvoicedOrdenes = filteredOrdenes.filter(
    (orden) => !orden.invoice?.id
  );
  if (search) {
    const normedSearch = normalizeText(search);
    filteredOrdenes = nonInvoicedOrdenes.filter((orden) => {
      const byId = orden.id && normalizeText(orden.id).includes(normedSearch);
      const byTotal =
        orden.total &&
        normalizeText(orden.total.toString()).includes(normedSearch);
      return byId || byTotal;
    });
  }
  // filters
  if (filters) {
    if (filters.status.length > 0) {
      filteredOrdenes = nonInvoicedOrdenes.filter((orden) => {
        return (
          orden.status &&
          filters.status.includes(decodeOrdenStatusTypes(orden.status) || "")
        );
      });
    }
    if (filters.client.length > 0) {
      filteredOrdenes = nonInvoicedOrdenes.filter((orden) => {
        return (
          orden.restaurantBranch?.branchName &&
          filters.client.includes(orden.restaurantBranch?.branchName)
        );
      });
    }
  }
  // only selected client
  if (clientToOrden) {
    filteredOrdenes = nonInvoicedOrdenes.filter(
      (orden) => orden.restaurantBranch.id === clientToOrden.id
    );
  }
  return filteredOrdenes as Array<OrdenType & { invoice?: InvoiceType }>;
};

// ----------------------------------------------------------------------

type PickOrdersSectionProps = {
  orders: Array<OrdenType>;
  title?: string;
  handleCheckboxChange: (orden: OrdenType) => void;
  selectedConsolidatedOrders: OrdenType[];
  setSelectedConsolidatedOrders: (ordenes: OrdenType[]) => void;
  setConsolidatedTotal: (total: number | undefined) => void;
  consolidatedTotal: number | undefined;
};

const PickOrdersSection: React.FC<PickOrdersSectionProps> = ({
  orders,
  title = undefined,
  handleCheckboxChange,
  selectedConsolidatedOrders,
  setSelectedConsolidatedOrders,
  setConsolidatedTotal,
  consolidatedTotal,
}) => {
  const theme = useTheme();
  // const payColorChip = paystatusChip(theme, orden);
  const { sessionToken } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any>({
    status: [],
    client: [],
  });
  const [dateRange, setDateRange] = useState<any>({
    start: null,
    end: null,
  });
  const { activeFilters, isLoading: ordenLoading } = useAppSelector(
    (state) => state.orden
  );
  const { activeUnit } = useAppSelector((state) => state.account);
  const { activeClients, clientToOrden } = useAppSelector(
    (state) => state.client
  );
  const dispatch = useAppDispatch();

  // on Mount state
  useEffect(() => {
    dispatch(clearActiveOrdenes());
    dispatch(
      setActiveOrdenesDateRange({
        start: inXTime(-30),
        end: inXTime(0),
      })
    );
    return () => {
      dispatch(clearActiveOrdenes());
    };
  }, [dispatch]);

  useEffect(() => {
    // [TODO] implement pagination
    if (!sessionToken) return;
    if (!dateRange.start || !dateRange.end) return;
    if (!activeUnit?.id) return;
    dispatch(setActiveOrdenes(activeUnit, dateRange, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, dateRange, sessionToken, activeUnit]);

  // effects
  useEffect(() => {
    setSearch(activeFilters.search);
    setSelectedFilters({
      status: activeFilters.status,
      client: activeFilters.client,
    });
    setDateRange(activeFilters.dateRange);
    setSelectedConsolidatedOrders([]);
    setConsolidatedTotal(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeFilters]);

  // on change client
  useEffect(() => {
    // clear ordenes
    setSelectedConsolidatedOrders([]);
    setConsolidatedTotal(undefined);
    // update active ordenes
    if (!sessionToken) return;
    if (!dateRange.start || !dateRange.end) return;
    if (!activeUnit?.id) return;
    dispatch(setActiveOrdenes(activeUnit, dateRange, sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clientToOrden]);

  // filters
  const filterOptions = [
    {
      label: "Estátus de entrega",
      key: "status",
      options: orders
        .map((orden: any) => decodeOrdenStatusTypes(orden.status))
        .filter((v: any) => v)
        .reduce((a: any, b: any) => (a.includes(b) ? a : [...a, b]), []),
    },
  ];

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
    setSelectedConsolidatedOrders([]);
    setConsolidatedTotal(undefined);
  };

  // filtering chips
  const filteringChips =
    (
      selectedFilters.status.map((val: any) => ({
        m: `Estátus: ${val}`,
        c: { k: "status", v: val },
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

  // filtering & searching
  const filteredOrdenes = searchAndFilter(
    search,
    selectedFilters,
    orders,
    activeClients,
    clientToOrden
  );

  return (
    <Box>
      <Card sx={{ my: 2, width: "100%" }}>
        <CardHeader title={title || "Selecciona Pedidos"} />
        <CardContent sx={{ m: 0, width: "100%" }}>
          {/* Button that calls the sort products by quantity function */}
          <Grid container>
            <Grid item md={12} xs={12} sx={{ px: { xs: 0, md: 1 } }}>
              {/* Search bar */}
              <SearchBar
                placeholder="Busca Pedido ..."
                searchValue={search}
                searchCallback={setSearch}
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
            <Grid item xs={12} md={9}>
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
            </Grid>
            <Grid
              item
              md={3}
              xs={12}
              justifyContent={"flex-end"}
              sx={{ pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 1 } }}
            ></Grid>
          </Grid>
          {/* Loading */}
          {ordenLoading && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="body1" color="textSecondary">
                Buscando pedidos ...
              </Typography>
            </Box>
          )}
          {ordenLoading && <LoadingProgress sx={{ my: 4 }} />}
          {/* Table of products */}
          {!ordenLoading ? (
            <DynamicTableLoader
              elements={filteredOrdenes}
              containerSx={{
                minHeight: { xs: 600, md: 700 },
              }}
              headers={
                <TableHead>
                  <TableRow>
                    <MHidden width="smDown">
                      {/* ID */}
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        ID Pedido
                      </TableCell>
                      {/* Delivery date  */}
                      <TableCell
                        align="left"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Fecha de Entrega
                      </TableCell>
                      {/* delivery status  */}
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Estátus
                      </TableCell>
                      {/* Payment method */}
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        M. de Pago
                      </TableCell>
                      {/* Total */}
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Total
                      </TableCell>
                    </MHidden>
                    <MHidden width="smUp">
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        ID Pedido
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Fecha de Entrega
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Estátus
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        M. de Pago
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        Total
                      </TableCell>
                    </MHidden>
                  </TableRow>
                </TableHead>
              }
              renderMap={(ninvo: Array<OrdenType>) => {
                return ninvo.map((order: OrdenType) => {
                  return (
                    <TableRow key={order.id}>
                      {/* Product Cell */}
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Grid item>
                            <CustomOrdenCheckbox
                              orden={order}
                              selected={selectedConsolidatedOrders.some(
                                (selectedOrder) => selectedOrder.id === order.id
                              )}
                              onCheckboxChange={handleCheckboxChange}
                            />
                          </Grid>
                          <Grid item>
                            {order.ordenNumber && (
                              <Typography variant="subtitle2">
                                # Pedido: {order.ordenNumber}
                              </Typography>
                            )}
                            <Link
                              to={`/app/orden/details/${order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {order.id}
                              </Typography>
                            </Link>
                          </Grid>
                        </Box>
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="body1">
                          {`${fISODate(order.deliveryDate)}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {order.paystatus && (
                          <Chip
                            label={paymentStatusTypes[order.paystatus]}
                            sx={{
                              mt: theme.spacing(1),
                              px: theme.spacing(2),
                              backgroundColor: paystatusChip(theme, order),
                              color: theme.palette.common.white,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        <br />
                        {order.status && (
                          <Chip
                            label={ordenStatusTypes[order.status]}
                            sx={{
                              mt: theme.spacing(1),
                              px: theme.spacing(2),
                              backgroundColor: statusChip(theme, order),
                              color: theme.palette.common.white,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          component="span"
                          variant="body1"
                          color="textSecondary"
                          sx={{ fontSize: 12 }}
                        >
                          {
                            paymentMethods[
                              order.paymentMethod?.toLowerCase() as paymentMethodType
                            ]
                          }
                        </Typography>
                      </TableCell>

                      {/* total Cell */}
                      <TableCell align="right">
                        {`${fCurrency(order.total)}`}
                      </TableCell>
                    </TableRow>
                  );
                });
              }}
            >
              {/* SI NO TIENE ORDENES EN ESAS FECHAS */}
              {filteredOrdenes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No hay pedidos que coincidan con la búsqueda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </DynamicTableLoader>
          ) : null}
          <Box sx={{ mt: 2 }}>
            <Table>
              <TableBody>
                <SummaryRow
                  sx={{
                    fontSize: theme.typography.subtitle1,
                    color: theme.palette.text.secondary,
                    fontWeight: theme.typography.fontWeightMedium,
                  }}
                  label="Total"
                  value={consolidatedTotal}
                  colSpan={4}
                  contentColSpan={1}
                />
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PickOrdersSection;
