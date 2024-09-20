import { SyntheticEvent, useEffect, useState } from "react";
// material
import {
  Box,
  Container,
  Grid,
  Step,
  StepLabel,
  Stepper,
  styled,
  useTheme,
} from "@mui/material";
// hooks
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
// redux
import { setNewOrden, setNewOrdenClient } from "../../../redux/slices/orden";
// styles
import { STab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// components
import Page from "../../../components/Page";
import OrdenDeliveryView from "./OrdenDelivery";
import OrdenPickupView from "./OrdenPickup";
import LoadingProgress from "../../../components/LoadingProgress";
// utils
import { delay } from "../../../utils/helpers";
import { mixtrack } from "../../../utils/analytics";
import { DeliveryType } from "../../../domain/supplier/SupplierProduct";
import { clearClientToOrden } from "../../../redux/slices/client";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

export const NEW_ORDEN_STEPS = [
  "Escoge tus productos",
  "Selecciona detalles de pedido",
  "Define método de pago",
];

// ----------------------------------------------------------------------

type AddOrdenProps = {
  viewMode: 'orden' | 'reInvoice';
};

const AddOrden: React.FC<AddOrdenProps> = ({viewMode}) => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [clientId, setClientId] = useState("");
  const [activeTab, setActiveTab] = useState<"pickup" | "delivery">("delivery");
  const [renderedActiveUnit, setRenderedActiveUnit] = useState<any>(null);
  const { newOrdenCurrentStep, newOrden, isLoading } = useAppSelector(
    (state) => state.orden
  );
  const { activeUnit } = useAppSelector((state) => state.account);

  useEffect(() => {
    return () => {
      dispatch(setNewOrdenClient({}));
      dispatch(clearClientToOrden());
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeUnit?.id && renderedActiveUnit?.id !== activeUnit?.id) {
      setRenderedActiveUnit(activeUnit);
      // if active tab is not in active unit delivery types, set active tab to first delivery type
      if (!(activeUnit?.deliveryTypes || []).includes(activeTab)) {
        setActiveTab(activeUnit?.deliveryTypes[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUnit]);

  // set suppliers
  useEffect(() => {
    setClientId(searchParams.get("clientId") || "");
  }, [searchParams]);

  // tab handlers
  const changeTab = (newValue: string) => {
    setActiveTab(newValue === "delivery" ? "delivery" : "pickup");
  };

  const handleChange = async (event: SyntheticEvent, newValue: string) => {
    const ordenCpy = { ...newOrden };
    navigate(`#${newValue}`);
    mixtrack("orden_type_tab_change", {
      visit: window.location.toString(),
      page: "AddOrden",
      section: "OrdenTypeNavTabs",
      tab: newValue,
    });
    // wait 1 second and reassign
    await delay(500);
    dispatch(setNewOrden(ordenCpy));
  };

  useEffect(() => {
    if (hash) {
      if (hash === "#delivery") {
        changeTab("delivery");
      } else {
        changeTab("pickup");
      }
    }
  }, [hash]);

  const availableDeliveryTypes = [
    ...(renderedActiveUnit?.deliveryTypes || []),
  ].sort();

  return (
    <RootStyle title={"Crear Pedido | Alima"}>
      <Container>
        <Grid
          container
          spacing={1}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ mb: theme.spacing(1), px: theme.spacing(0) }}
        >
          <Grid item xs={12} lg={8}>
            {/* stepper */}
            <Box sx={{ mb: theme.spacing(1) }}>
              <Stepper activeStep={newOrdenCurrentStep} alternativeLabel>
                {NEW_ORDEN_STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            {/* order type tabs */}
            <Box>
              <StyledTabs
                value={activeTab}
                onChange={handleChange}
                aria-label="info orden type tabs"
                centered
              >
                {availableDeliveryTypes.map((tab: DeliveryType) => {
                  const tabMapping: any = {
                    delivery: "Entrega",
                    pickup: "En Almacén",
                  };
                  return (
                    <STab
                      key={tab as string}
                      value={tab}
                      label={tabMapping[tab as string]}
                    />
                  );
                })}
                {/* <STab value="delivery" label="Entrega" />
                <STab value="pickup" label="En Almacén" /> */}
              </StyledTabs>
            </Box>
            {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
            {activeTab === "delivery" && !isLoading && (
              <OrdenDeliveryView clientId={clientId} viewMode={viewMode}/>
            )}
            {activeTab === "pickup" && !isLoading && (
              <OrdenPickupView clientId={clientId} viewMode={viewMode}/>
            )}
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
};

export default AddOrden;
