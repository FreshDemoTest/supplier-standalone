// material
import { Box, Grid, Typography, styled, useTheme } from "@mui/material";
//  hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
// components
import Page from "../../../components/Page";
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
import { useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router";
import { SaasPluginType } from "../../../domain/account/Business";
import { Plugin } from "../../../components/report/Plugin";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ReportPageProps = {
  title: string;
  pluginName?: string;
};

const ReportPage: React.FC<ReportPageProps> = ({ title, pluginName }) => {
  const theme = useTheme();
  const fetched = useRef<boolean>(false);
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { business, saasConfig } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);
  const [pluginConfig, setPluginConfig] = useState<SaasPluginType | undefined>(
    undefined
  );
  const [errorPlg, setErrorPlg] = useState<boolean>(false);

  // permission vars
  const allowReports = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-reports-view")
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
      navigate(PATH_APP.orden.list);
      enqueueSnackbar("No tienes acceso a los Reportes", {
        variant: "warning",
      });
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
    if (!saasConfig) return;
    const reportSectionDetails = retrieveUISectionDetails(
      "Reportes",
      saasConfig
    );
    if (!reportSectionDetails || !pluginName) {
      setErrorPlg(true);
      return;
    }
    // find plugin
    const plg = reportSectionDetails.plugins?.find(
      (p) => p.plugin_name === pluginName
    );
    if (!plg) {
      setErrorPlg(true);
      return;
    }
    setPluginConfig(plg);
  }, [saasConfig, pluginName]);

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
          {!pluginConfig && !errorPlg && (
            <LoadingProgress sx={{ mt: theme.spacing(5) }} />
          )}
          {pluginConfig && (
            <Box sx={{ mb: { xs: 2, md: 2 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: theme.typography.fontWeightMedium,
                  mb: 0.5,
                  color: theme.palette.text.secondary,
                }}
              >
                Reporte Personalizado
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: theme.typography.fontWeightMedium,
                  mb: 0.5,
                  color: theme.palette.text.secondary,
                }}
              >
                {pluginConfig.plugin_name}
              </Typography>
              {/* Plugin  */}
              <Box sx={{ mt: 2, mx: { xs: 1, md: 4 } }}>
                <Plugin {...pluginConfig} />
              </Box>
            </Box>
          )}
          {errorPlg && (
            <>
              <Box sx={{ mb: { xs: 2, md: 2 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                    mb: 0.5,
                  }}
                >
                  Reporte Personalizado
                </Typography>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                    mb: 0.5,
                  }}
                >
                  No se encontró el reporte personalizado
                </Typography>
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ReportProps = {};

const Report: React.FC<ReportProps> = () => {
  const { pluginSlug } = useParams<{ pluginSlug: string }>();

  if (!pluginSlug) {
    return <LoadingProgress sx={{ my: 6 }} />;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [subSName, pluginName, ...others] = pluginSlug.split("_");
  return (
    <ReportPage
      title={`${subSName} | ${pluginName} | Alima`}
      pluginName={pluginName}
    />
  );
};

export default Report;
