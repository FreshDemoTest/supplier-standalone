import { useEffect } from "react";
import { Container, Grid, styled, useTheme } from "@mui/material";
//  hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";
import ListNotInvoicedOrdenesView from "./ListNotInvoicedOrdenes";
// utils
import { mixtrack } from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";
// components
import Page from "../../../components/Page";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

const AddInvoice: React.FC<{}> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowFacturasList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "invoices-view-list")
    : true;

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowFacturasList) {
      navigate(PATH_APP.notAllowed);
      mixtrack("facturas_to_not_allowed_redirect", {
        visit: window.location.toString(),
        page: "ListInvoices",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  return (
    <RootStyle title={"Crear Factura Consolidada | Alima"}>
      <Container>
        <Grid
          container
          spacing={1}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ mb: theme.spacing(1), px: theme.spacing(0) }}
        >
          <Grid item xs={12} lg={10}>
            <ListNotInvoicedOrdenesView />
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
};

export default AddInvoice;
