// material
import { Grid, styled, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useEffect, useRef } from "react";
import useAuth from "../../../hooks/useAuth";
// components
import Page from "../../../components/Page";
// utils & routes
import { PATH_APP } from "../../../routes/paths";
// redux
import { getBusinessAccount } from "../../../redux/slices/account";
import LoadingProgress from "../../../components/LoadingProgress";
import {
  isAllowedTo,
  retrieveUISectionDetails,
} from "../../../utils/permissions";
import { useNavigate } from "react-router";
import DataReportsEcommerceSection from "../../../components/report/DataReportsEcommerce";
import track from "../../../utils/analytics";
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ListMetricsPage: React.FC = () => {
  const theme = useTheme();
  const fetched = useRef<boolean>(false);
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const { business, saasConfig } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permission vars
  const allowReports = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-reports-view") ||
      isAllowedTo(allowed?.unitPermissions, "ecommerce-view-list")
    : true;

  useEffect(() => {
    if (!business.id && sessionToken) {
      if (fetched.current) return;
      dispatch(getBusinessAccount(sessionToken));
      fetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  // Internal Reports Routing - redirect to orders if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowReports) {
      navigate(PATH_APP.notAllowed);
      track("view_item_list", {
        visit: window.location.toString(),
        page: "Ecommerce Reports",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowReports]); // [TOREV] @jorgeviz

  // verify if it has custom reports
  const reportSectionDetails = retrieveUISectionDetails("Reportes", saasConfig);
  const hasCustomReports =
    !!reportSectionDetails?.plugins && reportSectionDetails?.plugins.length > 0;

  return (
    <RootStyle title={"Mis Metricas"}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          mb: theme.spacing(1),
          px: theme.spacing(1),
        }}
      >
        <Grid item xs={12} lg={11}>
          {!business.id && <LoadingProgress sx={{ mt: theme.spacing(5) }} />}
          {business.id && (
            <div style={{ marginTop: "40px" }}>
              <DataReportsEcommerceSection
                businessId={business.id}
                hasPlugins={hasCustomReports}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

export default ListMetricsPage;
