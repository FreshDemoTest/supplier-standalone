import { useEffect } from "react";
import { Container, Grid, styled, useTheme } from "@mui/material";
//  hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";

// utils
import track from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";
// components
import Page from "../../../components/Page";
import ListPaymentsOrdenesView from "./ListPaymentOrders";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

const AddPayment: React.FC<{}> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowPaymentList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "add-payment-view")
    : true;

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowPaymentList) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "ListInvoices",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]); // [TOREV] @jorgeviz

  return (
    <RootStyle title={"Crear Pago Consolidado | Alima"}>
      <Container>
        <Grid
          container
          spacing={1}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ mb: theme.spacing(1), px: theme.spacing(0) }}
        >
          <Grid item xs={12} lg={10}>
          <ListPaymentsOrdenesView/>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
};

export default AddPayment;
