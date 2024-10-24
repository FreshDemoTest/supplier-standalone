import { useEffect, useRef, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import { Container } from "@mui/material";
// hooks
import useAuth from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useNavigate } from "react-router";
import usePermissions from "../hooks/usePermissions";
// redux
import {
  getUnits,
  getBusinessAccount,
  getSupplierAlimaAccount,
  setBusinessOnboarded,
} from "../redux/slices/account";
import { getProductCatalog } from "../redux/slices/supplier";
// routes
import { PATH_APP } from "../routes/paths";
// layouts
// components
import Page from "../components/Page";
import HomeView from "../components/home";
import LoadingProgress from "../components/LoadingProgress";
// utils
import track from "../utils/analytics";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

export default function Home() {
  // data refs
  const fetchedBARef = useRef(false);
  const fetchedUnitsRef = useRef(false);
  const fetchedCatRef = useRef(false);
  // vars
  const navigate = useNavigate();
  const { sessionToken, getSessionToken, user } = useAuth();
  const { business, units, error, legal, alimaAccount, isLoading } =
    useAppSelector((state) => state.account);
  const { supplierProdsCatalog } = useAppSelector((state) => state.supplier);
  const [createUn, setCreateUn] = useState(false);
  const [createCatalog, setCreateCatalog] = useState(false);
  const [createLegal, setCreateLegal] = useState(false);
  const [createBilling, setCreateBilling] = useState(false);
  const dispatch = useAppDispatch();
  const { loaded: permissionsLoaded, allowed } = usePermissions();

  // hook - update session token
  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  // Initialization
  useEffect(() => {
    if (!sessionToken) return;
    // routine to fetch all business & account info from backend
    if (!business.businessType && !fetchedBARef.current) {
      dispatch(getBusinessAccount(sessionToken));
      dispatch(getSupplierAlimaAccount(sessionToken));
      fetchedBARef.current = true;
    }
    if (
      business.businessType &&
      units.length === 0 &&
      !fetchedUnitsRef.current
    ) {
      dispatch(getUnits(business, sessionToken));
      fetchedUnitsRef.current = true;
    }
    if (supplierProdsCatalog.length === 0 && !fetchedCatRef.current) {
      dispatch(getProductCatalog(sessionToken));
      fetchedCatRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken, business]);

  useEffect(() => {
    setCreateUn(units.length !== 0);
  }, [units]);

  useEffect(() => {
    setCreateCatalog(supplierProdsCatalog.length !== 0);
  }, [supplierProdsCatalog]);

  useEffect(() => {
    setCreateLegal(legal.satRfc !== "");
  }, [legal]);

  useEffect(() => {
    setCreateBilling(!!alimaAccount?.account);
  }, [alimaAccount]);

  // Internal Home Routing
  useEffect(() => {
    // validation if business account is been created
    if (
      !business.businessType &&
      sessionToken &&
      error.active &&
      !isLoading &&
      fetchedBARef.current
    ) {
      // go to onboarding
      navigate(PATH_APP.account.onboarding);
      track("screen_view", {
        visit: window.location.toString(),
        page: "Home",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, sessionToken, error, isLoading]);

  // upload onboarded status
  useEffect(() => {
    dispatch(
      setBusinessOnboarded({
        bAccount: business.businessType ? true : false,
        units: createUn,
        billing: createBilling,
        legal: createLegal,
      })
    );
  }, [dispatch, business, createUn, createBilling, createLegal]);

  return (
    <>
      {!sessionToken && !permissionsLoaded && <LoadingProgress />}
      {sessionToken && permissionsLoaded && (
        <RootStyle title="Home | Alima">
          <Container>
            <HomeView
              businessName={business.businessName || "..."}
              businessId={business.id || ""}
              userName={user?.displayName || ""}
              createBusinessAccount={true}
              createUnit={createUn}
              createCatalog={createCatalog}
              createLegal={createLegal}
              createBilling={createBilling}
              units={units}
              permissionsLoaded={permissionsLoaded}
              allowed={allowed}
            />
          </Container>
        </RootStyle>
      )}
    </>
  );
}
