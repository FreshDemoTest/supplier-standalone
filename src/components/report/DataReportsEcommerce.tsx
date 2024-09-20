import { Fragment, useState } from "react";
import { Grid } from "@mui/material";
// components & styles
import MetabaseIFrame from "../report/MetabaseIFrame";
import { DataCardStyleLg } from "../../styles/cards/dataCards";
import DataReportsFilters, {
  DataReportsFiltersProps,
} from "./DataReportsFilters";
import LoadingProgress from "../LoadingProgress";
// utils & routes
import { fISODate, inXTime } from "../../utils/helpers";
// import useAuth from "../../hooks/useAuth";

// ----------------------------------------------------------------------

type DataReportsSectionProps = {
  businessId: string;
  hasPlugins?: boolean;
};

const DataReportsEcommerceSection: React.FC<DataReportsSectionProps> = ({
  businessId,
  hasPlugins = false,
}) => {
  // const { sessionToken } = useAuth();
  const [reportsFiltState, setReportsFiltState] =
    useState<DataReportsFiltersProps>({
      supplier_business: [businessId],
      desde: fISODate(inXTime(-90)),
      hasta: fISODate(inXTime(0)),
      periodo: "week",
    });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const metabaseDashs = {
    // main graph
    periodicSales: {
      dashboardId: 86,
      dashboardParams: {
        ...reportsFiltState,
      },
      title: "Trafico de Ecommerce",
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

  return (
    <Fragment>
      {/* Filters  */}
       {/* center to add margin top */}
       
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
        </Grid>
      )}
    </Fragment>
  );
};

export default DataReportsEcommerceSection;
