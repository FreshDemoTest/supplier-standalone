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
import ListInvoicesView from "./ListInvoices";
// utils
import track from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";
import { useSearchParams } from "react-router-dom";
import MHidden from "../../../components/extensions/MHidden";
import FixedAddButton from "../../../components/footers/FixedAddButton";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListInvoicesPageProps = {
  title: string;
  areLoaded: boolean;
  allowFacturas?: boolean;
  searchParams?: URLSearchParams;
};

const ListInvoicesPage: React.FC<ListInvoicesPageProps> = ({
  title,
  areLoaded = false,
  allowFacturas = true,
  searchParams,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

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
          {allowFacturas && (
            <ListInvoicesView
              search={searchParams?.get("search") || ""}
              pageNum={Number(searchParams?.get("page") || 1)}
            />
          )}
          {!allowFacturas && areLoaded && (
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
      {/* Mobile - Fixed add orden button */}
      <MHidden width="mdUp">
        <FixedAddButton
          buttonSize="medium"
          buttonMsg="Agregar Factura"
          onClick={() => {
            navigate(PATH_APP.invoice.add);
            track("select_content", {
              visit: window.location.toString(),
              page: "ListInvoices",
              section: "FixedAddButton",
            });
          }}
          sx={{
            bottom: { xs: 70, lg: 48 },
            left: { xs: "30%", md: "42%" },
          }}
        />
      </MHidden>
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
  const allowFacturasList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "invoices-view-list")
    : true;

  // Retrieve the search value from the URL
  const [searchParams] = useSearchParams();

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowFacturasList) {
      navigate(PATH_APP.notAllowed);
      track("screen_view", {
        visit: window.location.toString(),
        page: "ListInvoices",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]); // [TOREV] @jorgeviz

  return (
    <ListInvoicesPage
      title="Facturas | Alima"
      areLoaded={permissionsLoaded}
      allowFacturas={allowFacturasList}
      searchParams={searchParams}
    />
  );
};

export default ListInvoices;
