import { useEffect, useRef } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography, useTheme } from "@mui/material";
import questionMarkFill from "@iconify/icons-eva/question-mark-circle-outline";
// hooks
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useAuth from "../hooks/useAuth";
// redux
import { getPermissions } from "../redux/slices/permission";
// components
import Page from "../components/Page";
import LoadingProgress from "../components/LoadingProgress";
// routes
import { PATHS_EXTERNAL, PATH_APP } from "../routes/paths";
import FixedAddButton from "../components/footers/FixedAddButton";
import { mixtrack } from "../utils/analytics";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

export default function AccountDeleted() {
  const fetchedSessionToken = useRef(false);
  const theme = useTheme();
  const { sessionToken, getSessionToken } = useAuth();
  const { loaded, allowed } = useAppSelector((state) => state.permission);
  const { business } = useAppSelector((state) => state.account);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!sessionToken && !getSessionToken) {
      return;
    }
    // set timeout to wait for permission to load
    const intv = setInterval(() => {
      if (loaded && allowed) return;
      if (!sessionToken && !fetchedSessionToken.current) {
        getSessionToken();
        fetchedSessionToken.current = true;
        return;
      }
      if (!sessionToken) return;
      dispatch(getPermissions(sessionToken || ""));
    }, 10000);
    return () => clearInterval(intv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, getSessionToken]);

  useEffect(() => {
    if (allowed?.accountPermission) {
      navigate(PATH_APP.root);
    }
  }, [allowed, navigate]);

  return (
    <>
      {!loaded && <LoadingProgress />}
      {loaded && !allowed?.accountPermission && (
        <RootStyle title="Cuenta Eliminada | Alima">
          <Container>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" sx={{ mb: 3 }}>
                {business.active ? `Usuario Eliminado` : `Cuenta Desactivada`}
              </Typography>
              <Typography variant="body1">
                {business.active
                  ? `Tu usuario ha sido eliminado de ${business.businessName}, para cualquier aclaración contacta al administrador de tu cuenta.`
                  : `Tu cuenta ha sido deshabilitada. Si crees que esto es un error,
                contacta a nuestro soporte.`}
              </Typography>
            </Box>
            {/* Help button */}
            <FixedAddButton
              onClick={() => {
                mixtrack("deleted_account_help", {
                  visit: window.location.toString(),
                  page: "AccountDeleted",
                  section: "HelpBottomButton",
                });
                window.open(PATHS_EXTERNAL.supportAlimaWA, "_blank");
              }}
              buttonIcon={questionMarkFill}
              iconButtonSx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.secondary,
                boxShadow: theme.shadows[2],
              }}
              buttonMsg="Ayuda"
            />
          </Container>
        </RootStyle>
      )}
    </>
  );
}
