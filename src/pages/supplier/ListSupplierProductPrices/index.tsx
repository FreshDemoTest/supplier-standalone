import { SyntheticEvent, useEffect, useState } from "react";
// material
import { Box, Grid, styled, useTheme } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
//  hooks
import { useLocation, useNavigate } from "react-router";
// styles
import { STab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// components
import Page from "../../../components/Page";
import ListSupplierProductsView from "./ListSupplierProducts";
import ListSupplierPricesListsView from "./ListSupplierPricesLists";
// utils
import {
  isAllowedTo,
  retrieveUISectionDetails,
} from "../../../utils/permissions";
import track from "../../../utils/analytics";
// routes
import { PATH_APP } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import ListSupplierProductsStockView from "./ListSupplierProductStock";
import { getSupplierAlimaAccountSaasConfig } from "../../../redux/slices/account";
import useAuth from "../../../hooks/useAuth";
import { SaasPluginType } from "../../../domain/account/Business";
import LoadingProgress from "../../../components/LoadingProgress";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListSupplierProductsPageProps = {
  viewMode: "products" | "prices" | "stock";
  title: string;
};

const ListSupplierProductsPage: React.FC<ListSupplierProductsPageProps> = ({
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
  const [pluginConfig, setPluginConfig] = useState<SaasPluginType | undefined>(
    undefined
  );
  const [errorPlg, setErrorPlg] = useState<boolean>(false);

  // on dispatch ready
  useEffect(() => {
    if (!sessionToken) return;
    if (saasConfig && saasConfig?.config?.sections) return;
    dispatch(getSupplierAlimaAccountSaasConfig(sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  useEffect(() => {
    if (!saasConfig) return;
    const catalogSectionDetails = retrieveUISectionDetails(
      "Catálogo",
      saasConfig
    );
    if (!catalogSectionDetails) {
      setErrorPlg(true);
      return;
    }
    // find plugin
    const plg = catalogSectionDetails.plugins?.find(
      (p) => p.plugin_name === "Inventario"
    );
    if (!plg) {
      setErrorPlg(true);
      return;
    }
    setPluginConfig(plg);
  }, [saasConfig]);

  // handlers
  const changeTab = (newValue: string) => {
    setActiveTab(
      newValue === "products"
        ? "products"
        : newValue === "prices"
        ? "prices"
        : "stock"
    );
    setPageTitle(
      newValue === "products" ? "Mis Productos | Alima" : "Mis Precios | Alima"
    );
  };

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    // changeTab(newValue);
    navigate(`#${newValue}`);
    track("select_content", {
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
        <Grid item xs={12} lg={8}>
          <Box>
            <StyledTabs
              value={activeTab}
              onChange={handleChange}
              aria-label="info supplier tabs"
              centered
            >
              <STab value="products" label="Mis Productos" />
              <STab value="prices" label="Listas de Precios" />
              {/* Validate perms */}
              {!pluginConfig && !errorPlg && (
                <LoadingProgress sx={{ mt: theme.spacing(5) }} />
              )}
              {pluginConfig && <STab value="stock" label="Inventario" />}
              {errorPlg && (
                <STab
                  value="stock"
                  label={
                    <Box display="flex" alignItems="center">
                      Inventario <LockIcon sx={{ ml: 1 }} />
                    </Box>
                  }
                  disabled
                />
              )}
            </StyledTabs>
          </Box>
          {activeTab === "products" && <ListSupplierProductsView />}
          {activeTab === "prices" && <ListSupplierPricesListsView />}
          {activeTab === "stock" && <ListSupplierProductsStockView />}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListSuppliersViewProps = {
  viewMode: "products" | "prices" | "stock";
};

const ListSupplierProducts: React.FC<ListSuppliersViewProps> = ({
  viewMode,
}) => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "prices" | "stock">(
    viewMode
  );
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowSupProdsList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "catalog-view-list")
    : true;

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowSupProdsList) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "ListSupplierProducts",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  // handling hash at URL to set viewMode
  useEffect(() => {
    if (hash) {
      if (hash === "#products") {
        setActiveTab("products");
      } else if (hash === "#prices") {
        setActiveTab("prices");
      } else if (hash === "#stock") {
        setActiveTab("stock");
      } else {
        setActiveTab("products");
      }
    }
  }, [hash]);

  return (
    <ListSupplierProductsPage title="Productos | Alima" viewMode={activeTab} />
  );
};

export default ListSupplierProducts;
