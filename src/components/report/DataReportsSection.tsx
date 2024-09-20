import { Fragment, useEffect, useState } from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
// components & styles
import MetabaseIFrame from "../report/MetabaseIFrame";
import { DataCardStyleLg } from "../../styles/cards/dataCards";
import DataReportsFilters, {
  CollectionsReportFilters,
  DataReportsFiltersProps,
} from "./DataReportsFilters";
import LoadingProgress from "../LoadingProgress";
// utils & routes
import { fISODate, inXTime } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { getActiveClients } from "../../redux/slices/client";
import { Link } from "react-router-dom";
import MHidden from "../extensions/MHidden";
import { PATH_APP } from "../../routes/paths";

// ----------------------------------------------------------------------

type DataReportsSectionProps = {
  businessId: string;
  hasPlugins?: boolean;
};

const DataReportsSection: React.FC<DataReportsSectionProps> = ({
  businessId,
  hasPlugins = false,
}) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const { units } = useAppSelector((state) => state.account);
  const { activeClients } = useAppSelector((state) => state.client);
  const dispatch = useAppDispatch();
  const [reportsFiltState, setReportsFiltState] =
    useState<DataReportsFiltersProps>({
      supplier_business: [businessId],
      desde: fISODate(inXTime(-90)),
      hasta: fISODate(inXTime(0)),
      periodo: "week",
    });
  const [generalReportsFiltState, setGeneralReportsFiltState] = useState<{
    restaurant_branch_id: string;
  }>({ restaurant_branch_id: "" });
  const [generalReports, setGeneralReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);
  const [clientFilterOpts, setClientFilterOpts] = useState<any[]>([]); // [{id: 1, name: "name"}]

  // hooks
  useEffect(() => {
    setGeneralReports([75]); // injecting reporte cobranza dashboard

    // if active clients already loaded skip
    if (activeClients.length > 0) {
      return;
    }
    // if no session or units skip
    if (!sessionToken) return;
    if (!units.length) return;
    // fetch active clients
    dispatch(
      getActiveClients(
        units.filter((u: any) => !u.deleted).map((u: any) => u.id),
        sessionToken
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, units]);

  // hook - set default restaurant branch
  useEffect(() => {
    if (!activeClients) return;
    if (activeClients.length === 0) return;
    const sortedClts = (activeClients || [])
      .map((c: any) => ({
        value: c.id,
        label: c.branchName,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
    setGeneralReportsFiltState({
      restaurant_branch_id: sortedClts[0].value,
    });
    setClientFilterOpts(sortedClts);
  }, [activeClients]);

  const metabaseDashs = {
    // main graph
    periodicSales: {
      dashboardId: 67,
      dashboardParams: {
        ...reportsFiltState,
      },
      title: "Reporte de Ventas por Periodo",
      height: 500,
      waitPeriod: {
        var: 2000,
        min: 500,
      },
    },
    salesByClient: {
      dashboardId: 70,
      dashboardParams: {
        ...reportsFiltState,
      },
      title: "Reporte de Ventas por Cliente",
      height: 500,
      waitPeriod: {
        var: 2000,
        min: 500,
      },
    },
    topSoldProducts: {
      dashboardId: 68,
      dashboardParams: {
        ...reportsFiltState,
      },
      title: "Reporte de Ventas por Producto",
      height: 500,
      waitPeriod: {
        var: 2000,
        min: 500,
      },
    },
  };

  // handlers
  const handleFiltersChange = (v: any) => {
    setIsLoading(true);
    setReportsFiltState({
      ...reportsFiltState,
      ...v,
    });
    // put loading after 2 secs timeout
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleCustomFiltersChange = (v: any) => {
    setIsCustomLoading(true);
    setGeneralReportsFiltState({
      ...generalReportsFiltState,
      ...v,
    });
    // put loading after 2 secs timeout
    setTimeout(() => {
      setIsCustomLoading(false);
    }, 1000);
  };

  return (
    <Fragment>
      {/* Filters */}
      <Box sx={{ mb: { xs: 2, md: 2 } }}>
        <Grid container>
          {hasPlugins ? (
            <MHidden width="mdUp">
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                {/* Go to custom reports */}
                <Link to={PATH_APP.report.custom}>
                  <Button variant="outlined" color="info">
                    Reportes Personalizados
                  </Button>
                </Link>
              </Grid>
            </MHidden>
          ) : null}
          <Grid item xs={12} md={9}>
            <Typography
              variant="h4"
              sx={{ fontWeight: theme.typography.fontWeightMedium, mb: 0.5 }}
            >
              Reportes
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              Selecciona el periodo de tiempo y el rango de fechas para ver tus
              reportes.
            </Typography>
          </Grid>
          {/* Desktop only */}
          {hasPlugins ? (
            <MHidden width="mdDown">
              <Grid item xs={12} md={3}>
                {/* Go to custom reports */}
                <Link to={PATH_APP.report.custom}>
                  <Button variant="outlined" color="info">
                    Reportes Personalizados
                  </Button>
                </Link>
              </Grid>
            </MHidden>
          ) : null}
        </Grid>
      </Box>
      {/* Filters  */}
      <DataReportsFilters
        callback={handleFiltersChange}
        {...reportsFiltState}
      />
      {/* Loading  */}
      {isLoading && <LoadingProgress sx={{ my: 2 }} />}
      {/* Reports */}
      {!isLoading && (
        <Grid container sx={{ mt: 3 }}>
          {/*  1st row */}
          <Grid item xs={12} md={12}>
            {/* Sales by period */}
            <DataCardStyleLg
              sx={{ height: { xs: 400, md: 490 }, pt: { xs: -10, md: 0 } }}
            >
              <MetabaseIFrame {...metabaseDashs.periodicSales} />
            </DataCardStyleLg>
          </Grid>
          {/* 2nd row */}
          <Grid item xs={12} md={12}>
            {/* Sales by client */}
            <DataCardStyleLg
              sx={{ height: { xs: 400, md: 490 }, pt: { xs: -10, md: 0 } }}
            >
              <MetabaseIFrame {...metabaseDashs.salesByClient} />
            </DataCardStyleLg>
          </Grid>
          {/* 3rd row */}
          <Grid item xs={12} md={12}>
            {/* Sales by client */}
            <DataCardStyleLg
              sx={{ height: { xs: 400, md: 490 }, pt: { xs: -10, md: 0 } }}
            >
              <MetabaseIFrame {...metabaseDashs.topSoldProducts} />
            </DataCardStyleLg>
          </Grid>
        </Grid>
      )}
      {/* custom Loading  */}
      {isCustomLoading && <LoadingProgress sx={{ my: 2 }} />}
      {/* custom reports */}
      <Grid container sx={{ mt: 3 }}>
        {!isCustomLoading &&
          generalReports.length > 0 &&
          generalReports.map((cr) => {
            const customCollects = {
              dashboardId: cr,
              dashboardParams: {
                supplier_business: reportsFiltState.supplier_business,
                desde: reportsFiltState.desde,
                hasta: reportsFiltState.hasta,
                restaurant_branch_id:
                  generalReportsFiltState.restaurant_branch_id,
              },
              title: "Reporte de Cobranza por Cliente",
              height: 500,
              waitPeriod: {
                var: 2000,
                min: 500,
              },
            };
            return (
              <Grid item key={cr} xs={12} md={12}>
                <CollectionsReportFilters
                  restaurant_branch_id={
                    generalReportsFiltState.restaurant_branch_id
                  }
                  restaurantOptions={clientFilterOpts}
                  callback={handleCustomFiltersChange}
                />
                {/* Collections by customer */}
                <DataCardStyleLg
                  sx={{ height: { xs: 400, md: 490 }, pt: { xs: -10, md: 0 } }}
                >
                  {customCollects.dashboardParams.restaurant_branch_id && (
                    <MetabaseIFrame {...customCollects} />
                  )}
                </DataCardStyleLg>
              </Grid>
            );
          })}
      </Grid>
    </Fragment>
  );
};

export default DataReportsSection;
