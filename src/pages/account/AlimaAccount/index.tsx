import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
// material
import { styled } from "@mui/material/styles";
import {
  useTheme,
  Box,
  Container,
  Grid,
  Typography,
  Button,
} from "@mui/material";
// styles
import { S3Tab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// hooks
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// redux
import {
  getBusinessAccount,
  getHistoricAlimaInvoicesDetails,
  getSupplierAlimaAccount,
} from "../../../redux/slices/account";
// routes
import { PATHS_EXTERNAL, PATH_APP } from "../../../routes/paths";
// components
import Page from "../../../components/Page";
import AlimaAccountPlan from "./AlimaAccountPlan";
import LoadingProgress from "../../../components/LoadingProgress";
import ChargesInfo from "./ChargesInfo";
import PayMethodsInfo from "./PayMethodsInfo";
// utils
// import { isAllowedTo } from '../../../utils/permissions';
import track from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

type AlimaPlanTabType = "plan" | "charges" | "paymethods";

export default function AlimaAccount() {
  const theme = useTheme();
  const fetchedAlAcc = useRef(false);
  const { hash } = useLocation();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AlimaPlanTabType>("plan");
  const dispatch = useAppDispatch();
  const { alimaAccount, isLoading, business, historicAlimaInvoices } =
    useAppSelector((state) => state.account);
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowAlimaPlan = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-alima-plan-view")
    : true;
  const allowCharges = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-alima-billing-view")
    : true;
  const allowPayMethods = isBusinessOnboarded
    ? isAllowedTo(
        allowed?.unitPermissions,
        "usersadmin-alima-billing-method-view"
      )
    : true;

  // fetch Alima Account
  useEffect(() => {
    if (sessionToken && !fetchedAlAcc.current) {
      dispatch(getSupplierAlimaAccount(sessionToken));
      dispatch(getBusinessAccount(sessionToken));
      dispatch(getHistoricAlimaInvoicesDetails(sessionToken));
      fetchedAlAcc.current = true;
    }
  }, [dispatch, sessionToken]);

  // handling hash at URL to set viewMode
  useEffect(() => {
    if (hash) {
      if (hash === "#plan") {
        setActiveTab("plan");
      } else if (hash === "#charges") {
        setActiveTab("charges");
      } else {
        setActiveTab("paymethods");
      }
    }
  }, [hash]);

  // handlers
  const changeTab = (newValue: AlimaPlanTabType) => {
    // view alima plan tab is disabled
    if (newValue === "plan" && !allowAlimaPlan) return;
    // view charges tab is disabled
    if (newValue === "charges" && !allowCharges) return;
    // view pay methods tab is disabled
    if (newValue === "paymethods" && !allowPayMethods) return;
    // change tab
    navigate(`#${newValue}`);
  };

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowAlimaPlan) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "AlimaAccount",
        section: activeTab,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  const handleChange = (event: any, newValue: AlimaPlanTabType) => {
    changeTab(newValue);
    track("select_content", {
      visit: window.location.toString(),
      page: "BusinessAccount",
      section: "NavTabs",
      tab: newValue,
    });
  };

  // render var
  const noShowAccount = alimaAccount && !alimaAccount.account;
  const loadingDisplay = isLoading || alimaAccount === undefined || business === undefined;

  return (
    <>
      {loadingDisplay && <LoadingProgress />}
      {!loadingDisplay && (
        <RootStyle title="Suscripción Alima | Alima">
          <Container>
            {noShowAccount && (
              <Grid
                container
                spacing={1}
                justifyContent={"center"}
                alignItems={"center"}
                sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
              >
                <Grid item xs={12} lg={8}>
                  <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" gutterBottom>
                        Tu cuenta en Alima Seller no ha sido activada.
                      </Typography>
                      <Typography sx={{ color: "text.secondary" }}>
                        {" "}
                        Termina de hacer tu registro, para poder validar tu
                        información. Si tienes alguna duda, contacta a uno de
                        nuestros representantes.
                      </Typography>
                      <Box sx={{ mt: 4 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() =>
                            window.open(PATHS_EXTERNAL.supportAlimaWA)
                          }
                        >
                          Contactar un representante
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
            {!noShowAccount && (
              <Grid
                container
                spacing={1}
                justifyContent={"center"}
                alignItems={"center"}
                sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
              >
                <Grid item xs={12} lg={8}>
                  <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" gutterBottom>
                        Suscripción Alima
                      </Typography>
                      <Typography sx={{ color: "text.secondary" }}>
                        {" "}
                        Verifica que tipo de plan tienes con nosotros, las
                        tarifas, las facturas históricas, y tus métodos de pago.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} lg={8}>
                  <Box>
                    <StyledTabs
                      value={activeTab}
                      onChange={handleChange}
                      aria-label="info alima account tabs"
                      centered
                    >
                      <S3Tab
                        disabled={!allowAlimaPlan}
                        value="plan"
                        label="Mi Suscripción"
                      />
                      <S3Tab
                        disabled={!allowPayMethods}
                        value="paymethods"
                        label="M. de pago"
                      />
                      <S3Tab
                        disabled={!allowCharges}
                        value="charges"
                        label="Facturas"
                      />
                    </StyledTabs>
                  </Box>
                  {activeTab === "plan" && (
                    <AlimaAccountPlan
                      alimaAccount={alimaAccount}
                      business={business}
                    />
                  )}
                  {activeTab === "charges" && (
                    <ChargesInfo charges={historicAlimaInvoices} />
                  )}
                  {activeTab === "paymethods" && (
                    <PayMethodsInfo
                      paymentMethods={alimaAccount?.paymentMethods || []}
                    />
                  )}
                </Grid>
              </Grid>
            )}
          </Container>
        </RootStyle>
      )}
    </>
  );
}
