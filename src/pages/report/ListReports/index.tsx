// material
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
//  hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
// components
import Page from "../../../components/Page";
import DataReportsSection from "../../../components/report/DataReportsSection";
// utils & routes
import track from "../../../utils/analytics";
import { PATH_APP } from "../../../routes/paths";
// redux
import { getBusinessAccount } from "../../../redux/slices/account";
import LoadingProgress from "../../../components/LoadingProgress";
import {
  isAllowedTo,
  retrieveUISectionDetails,
} from "../../../utils/permissions";
import { useNavigate } from "react-router";
import { SaasSubsectionType } from "../../../domain/account/Business";
import { Link } from "react-router-dom";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListReportsPageProps = {
  title: string;
};

const ListReportsPage: React.FC<ListReportsPageProps> = ({ title }) => {
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
      isAllowedTo(allowed?.unitPermissions, "reports-view-list")
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
        page: "Reports",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowReports]);

  // verify if it has custom reports
  const reportSectionDetails = retrieveUISectionDetails("Reportes", saasConfig);
  const hasCustomReports =
    !!reportSectionDetails?.plugins && reportSectionDetails?.plugins.length > 0;

  return (
    <RootStyle title={title}>
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
            <DataReportsSection
              businessId={business.id}
              hasPlugins={hasCustomReports}
            />
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

const ListCustomReportsPage: React.FC<ListReportsPageProps> = ({ title }) => {
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
  const [customReportsUI, setCustomReportsUI] = useState<
    SaasSubsectionType | undefined
  >(undefined);

  // permission vars
  const allowReports = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-reports-view") ||
      isAllowedTo(allowed?.unitPermissions, "personalized-reports-view-list")
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
        page: "Reports",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowReports]);

  // verify if it has custom reports

  useEffect(() => {
    const reportSectionDetails = retrieveUISectionDetails(
      "Reportes",
      saasConfig
    );
    if (!reportSectionDetails) {
      setCustomReportsUI({
        subsection_id: "",
        subsection_name: "No hay reportes personalizados",
        available: false,
        plugins: [],
      });
    }
    setCustomReportsUI(reportSectionDetails);
  }, [saasConfig]);

  return (
    <RootStyle title={title}>
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
          {!customReportsUI && (
            <LoadingProgress sx={{ mt: theme.spacing(5) }} />
          )}
          {customReportsUI && (
            <>
              <Box sx={{ mb: { xs: 2, md: 2 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                    mb: 0.5,
                  }}
                >
                  Reportes Personalizados
                </Typography>
              </Box>
              <Box sx={{ mt: 4, height: "64vh", overflowY: "scroll" }}>
                <Grid container>
                  {customReportsUI.plugins &&
                    customReportsUI.plugins.map((plugin) => {
                      return (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          key={plugin.plugin_id}
                          sx={{ px: 2 }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              height: 120,
                              my: 1,
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            <Typography
                              variant="h6"
                              align="center"
                              color="text.secondary"
                              sx={{ mt: 1, px: 3 }}
                            >
                              {plugin.plugin_name}
                              <Link
                                to={PATH_APP.report.details.replace(
                                  ":pluginSlug",
                                  `${customReportsUI.subsection_name}_${plugin.plugin_name}`
                                )}
                              >
                                <IconButton size="small" edge="end">
                                  <OpenInNewIcon
                                    sx={{ height: 18, width: 18 }}
                                  />
                                </IconButton>
                              </Link>
                            </Typography>
                            {plugin.plugin_params && (
                              <Typography
                                variant="body2"
                                align="center"
                                color="text.secondary"
                                sx={{ mt: 1, px: 3 }}
                              >
                                Con filtros por{" "}
                                {plugin.plugin_params
                                  .map((param) => param.param_name)
                                  .join(", ")}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                </Grid>
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListReportsProps = {
  viewMode?: "general" | "custom";
};

const ListReports: React.FC<ListReportsProps> = ({ viewMode = "general" }) => {
  if (viewMode === "custom") {
    return <ListCustomReportsPage title="Reportes Personalizados | Alima" />;
  }
  // general
  return <ListReportsPage title="Reportes | Alima" />;
};

export default ListReports;
