import { useEffect } from "react";
// material
import { Grid, Typography, styled, useTheme } from "@mui/material";
//  hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";
// components
import Page from "../../../components/Page";
import ListPaymentsView from "./ListPayments";
// utils
import track from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";
import { useSearchParams } from "react-router-dom";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListPaymentsPageProps = {
  title: string;
  areLoaded: boolean;
  allowPagos?: boolean;
  searchParams?: URLSearchParams;
};

const ListPaymentsPage: React.FC<ListPaymentsPageProps> = ({
  title,
  areLoaded = false,
  allowPagos = true,
  searchParams,
}) => {
  const theme = useTheme();

  return (
    <RootStyle title={title}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          mt: theme.spacing(1),
          mb: theme.spacing(1),
          px: theme.spacing(1),
        }}
      >
        <Grid item xs={12} lg={8}>
          {allowPagos && (
            <ListPaymentsView
              search={searchParams?.get("search") || ""}
              pageNum={Number(searchParams?.get("page") || 1)}
            />
          )}
          {!allowPagos && areLoaded && (
            <Grid
              container
              spacing={1}
              justifyContent={"center"}
              alignItems={"center"}
              sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
            >
              <Grid item xs={12} lg={8}>
                <Typography variant="h6">
                  No tienes acceso a esta sección
                </Typography>
                <Typography variant="body2">
                  Si crees que esto es un error, por favor contacta al
                  administrador.
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListInvoicesViewProps = {};

const ListInvoices: React.FC<ListInvoicesViewProps> = () => {
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowPagosList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "payments-view-list")
    : true;

  // Retrieve the search value from the URL
  const [searchParams] = useSearchParams();

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowPagosList) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "ListPayments",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  return (
    <ListPaymentsPage
      title="Pagos | Alima"
      areLoaded={permissionsLoaded}
      allowPagos={allowPagosList}
      searchParams={searchParams}
    />
  );
};

export default ListInvoices;
