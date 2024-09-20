import { SyntheticEvent, useEffect, useState } from "react";
// material
import { Box, Grid, styled, useTheme } from "@mui/material";
//  hooks
import { useLocation, useNavigate } from "react-router";
// styles
import { STab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// components
import Page from "../../../components/Page";
// utils
import { isAllowedTo } from "../../../utils/permissions";
import { mixtrack } from "../../../utils/analytics";
// routes
import { PATH_APP } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { getSupplierAlimaAccountSaasConfig } from "../../../redux/slices/account";
import useAuth from "../../../hooks/useAuth";
import ListMetricsPage from "./ListMetrics";
import EditEcommerce from "./EditEcommerce";
// import { SaasPluginType } from "../../../domain/account/Business";
// import LoadingProgress from "../../../components/LoadingProgress";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListEcommercePageProps = {
  viewMode: "metrics" | "custom";
  title: string;
};

const ListEcommercePage: React.FC<ListEcommercePageProps> = ({
  viewMode,
  title,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(viewMode);
  const [pageTitle, setPageTitle] = useState(title);
  const { sessionToken } = useAuth();
  const { saasConfig } = useAppSelector((state) => state.account);

  // on dispatch ready
  useEffect(() => {
    if (!sessionToken) return;
    if (saasConfig && saasConfig?.config?.sections) return;
    dispatch(getSupplierAlimaAccountSaasConfig(sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  // useEffect(() => {
  //   if (!saasConfig) return;
  //   const catalogSectionDetails = retrieveUISectionDetails(
  //     "Catálogo",
  //     saasConfig
  //   );
  //   if (!catalogSectionDetails) {
  //     setErrorPlg(true);
  //     return;
  //   }
  //   // find plugin
  //   const plg = catalogSectionDetails.plugins?.find(
  //     (p) => p.plugin_name === "Inventario"
  //   );
  //   if (!plg) {
  //     setErrorPlg(true);
  //     return;
  //   }
  //   setPluginConfig(plg);
  // }, [saasConfig]);

  // handlers
  const changeTab = (newValue: string) => {
    setActiveTab(newValue === "metrics" ? "metrics" : "custom");
    setPageTitle(
      newValue === "metrics"
        ? "Mis Metricas | Alima"
        : "Mi Personalización | Alima"
    );
  };

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    // changeTab(newValue);
    navigate(`#${newValue}`);
    mixtrack("supplier_products_tab_change", {
      visit: window.location.toString(),
      page: "ListSupplierProducts",
      section: "SuppliersNavTabs",
      tab: newValue,
    });
  };

  useEffect(() => {
    changeTab(viewMode);
  }, [viewMode]);

  //

  return (
    <RootStyle title={pageTitle}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
      >
        <Grid item xs={12} lg={10}>
          <Box>
            <StyledTabs
              value={activeTab}
              onChange={handleChange}
              aria-label="info ecommerce tabs"
              centered
            >
              <STab value="metrics" label="Métricas" />
              <STab value="custom" label="Personalización" />
              {/* Validate perms */}
            </StyledTabs>
          </Box>
          {activeTab === "metrics" && <ListMetricsPage />}
          {activeTab === "custom" && <EditEcommerce />}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListEcommerceViewProps = {
  viewMode: "metrics" | "custom";
};

const ListEcommerce: React.FC<ListEcommerceViewProps> = ({
  viewMode,
}) => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState<"metrics" | "custom">(viewMode);
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions [TODO] change perms
  const allowSupProdsList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-reports-view")
    : true;

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowSupProdsList) {
      navigate(PATH_APP.notAllowed);
      mixtrack("ecommerce_to_not_allowed_redirect", {
        visit: window.location.toString(),
        page: "ListEcommerce",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  // handling hash at URL to set viewMode
  useEffect(() => {
    if (hash) {
      if (hash === "#metrics") {
        setActiveTab("metrics");
      } else if (hash === "#custom") {
        setActiveTab("custom");
      } else {
        setActiveTab("metrics");
      }
    }
  }, [hash]);

  return (
    <ListEcommercePage title="Ecommerce | Alima" viewMode={activeTab} />
  );
};

export default ListEcommerce;
