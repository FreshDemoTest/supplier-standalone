import React, { useEffect, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Card, Container, useTheme, Typography } from "@mui/material";
import questionMarkFill from "@iconify/icons-eva/question-mark-circle-outline";
// hooks
import useAuth from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useNavigate } from "react-router";
// redux
import {
  createSupplierAlimaAccount,
  getBusinessAccount,
  getSupplierAlimaAccount,
  getUnits,
} from "../redux/slices/account";
// routes
import { PATHS_EXTERNAL, PATH_APP } from "../routes/paths";
// layouts
import AuthLayout from "../layouts/AuthLayout";
// components
import Page from "../components/Page";
import MHidden from "../components/extensions/MHidden";
import BusinessAccountForm from "../components/BusinessAccountForm";
import BasicDialog from "../components/navigation/BasicDialog";
import LoadingProgress from "../components/LoadingProgress";
// utils
import { delay } from "../utils/helpers";
import track from "../utils/analytics";
import FixedAddButton from "../components/footers/FixedAddButton";
import SUnitForm from "../components/account/SUnitForm";
import AlimaSupplyPlan, {
  ALIMA_SUPPLY_PLANS,
  AlimaPlanType,
} from "../components/billing/AlimaSupplyPlan";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { AlimaPaymentMethodsType } from "../domain/account/Business";
import { SetupStripeCardPayment } from "./account/AlimaAccount/PayMethodsInfo";
import BillingInfoForm from "../components/account/BillingInfoForm";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  paddingTop: theme.spacing(15),
  width: "100%",
  maxWidth: 464,
  // display: 'flex',
  // flexDirection: 'column',
  justifyContent: "center",
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

// onboarding steps

const ONBOARDING_STEPS = {
  BUSINESS_ACCOUNT: 0,
  SUPPLIER_UNIT: 1,
  PLAN_SELECTION: 2,
  PAYMENT_METHOD: 3,
  DONE: 4,
  REDIRECTED: 5,
};

// Business Onboarding View

type OnboardingSectionProps = {
  onSuccessCallback: (flag: boolean) => void;
};

const BusinessOnboardingView: React.FC<OnboardingSectionProps> = ({
  onSuccessCallback,
}) => {
  return (
    <>
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            ¡Tu usuario fue validado con éxito!
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {" "}
            Ya casi terminamos... para avanzar proporciónanos la información de
            tu negocio.
          </Typography>
        </Box>
      </Box>

      {/* Onboarding Form  */}
      <BusinessAccountForm onSuccessCallback={onSuccessCallback} />
    </>
  );
};

const SupplierUnitOnboardingView: React.FC<OnboardingSectionProps> = ({
  onSuccessCallback,
}) => {
  return (
    <>
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Agrega Centro de Distribución
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {" "}
            Un pasito más... agrega la información de tu centro de distribución.
            En caso que tengas más de uno, no te preocupes más adelante podrás
            agregar los demás.
          </Typography>
        </Box>
      </Box>

      {/* Supplier Unit Form  */}
      <SUnitForm onSuccessCallback={() => onSuccessCallback(true)} />
    </>
  );
};

const PlanSelectionOnboardingView: React.FC<OnboardingSectionProps> = ({
  onSuccessCallback,
}) => {
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedPlan, setSelectedPlan] = useState<AlimaPlanType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    try {
      if (!sessionToken || !selectedPlan) {
        enqueueSnackbar("Por favor selecciona un plan", { variant: "error" });
        return;
      }
      setIsSubmitting(true);
      // call backend to create account with selected plan
      await dispatch(
        createSupplierAlimaAccount(sessionToken, selectedPlan as AlimaPlanType)
      );
      onSuccessCallback(true);
      setIsSubmitting(false);
    } catch (e) {
      setIsSubmitting(false);
      console.error(e);
      enqueueSnackbar(`Error al seleccionar Plan: ${e}`, { variant: "error" });
    }
  };

  return (
    <>
      <Box sx={{ mt: 2, mb: 3, display: "flex", alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Escoge tu Plan
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {" "}
            Ahora que tu cuenta está creada, selecciona el plan que más se
            ajuste a tus necesidades. Lo podrás cambiar en cualquier momento.
            <br />
            <br /> Y no te preocupes, tienes <b>30 días</b> para probarlo{" "}
            <b>gratis</b>.
          </Typography>
        </Box>
      </Box>

      {Object.entries(ALIMA_SUPPLY_PLANS)
        .filter(([k, v]) => k !== "alima_comercial")
        .map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <AlimaSupplyPlan
              plan={key as AlimaPlanType}
              selected={selectedPlan === key}
              onClick={() => setSelectedPlan(key as AlimaPlanType)}
            />
          </Box>
        ))}

      <LoadingButton
        variant="contained"
        disabled={!selectedPlan}
        sx={{ mt: 2 }}
        onClick={handleCreateAccount}
        loading={isSubmitting}
      >
        Continuar{" "}
        {selectedPlan
          ? `con ${ALIMA_SUPPLY_PLANS[selectedPlan].name.replace("alima ", "")}`
          : ""}
      </LoadingButton>
    </>
  );
};

const PaymentInfoOnboardingView: React.FC<
  OnboardingSectionProps & { paymentMethod: AlimaPaymentMethodsType }
> = ({ onSuccessCallback, paymentMethod }) => {
  return (
    <>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Por último, agrega tu Método de Pago
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {" "}
            Por favor agrega tu tarjeta, no se te hará ningún cargo hasta no
            terminar tu periodo de prueba.
            <br />
            <br />Y podrás cancelar cuando tu quieras.
          </Typography>
        </Box>
      </Box>
      {/* Payment Form */}
      <SetupStripeCardPayment {...paymentMethod} />

      {/* Billing info Form */}
      {(paymentMethod.stripeCards || []).length > 0 && (
        <BillingInfoForm onSuccessCallback={onSuccessCallback} />
      )}
    </>
  );
};

// ----------------------------------------------------------------------

export default function Onboarding() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionToken, getSessionToken } = useAuth();
  const {
    business,
    businessLoaded,
    units,
    alimaAccount,
    legal,
    error: accountError,
  } = useAppSelector((state) => state.account);
  const [readyToRender, setReadyToRender] = useState(false); // Turned on - after fetch of supplier account
  const [onboardingStep, setOnboardingStep] = useState(
    ONBOARDING_STEPS.BUSINESS_ACCOUNT
  );
  const dispatch = useAppDispatch();

  // hook - if error fetching account -> render
  useEffect(() => {
    if (accountError.active) {
      setReadyToRender(true);
    }
  }, [accountError]);

  // hook - update session token
  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  // hook - get supplier account in case it exists
  useEffect(() => {
    // routine to fetch all business & account info from backend
    if (sessionToken) {
      dispatch(getBusinessAccount(sessionToken));
    }
  }, [dispatch, sessionToken]);

  // hook - get supplier units in case it exists
  useEffect(() => {
    const _dispatchUnitsAndAccount = async () => {
      if (business.businessType && sessionToken) {
        await dispatch(getUnits(business, sessionToken));
        await dispatch(getSupplierAlimaAccount(sessionToken));
        setReadyToRender(true);
      } else if (businessLoaded) {
        setReadyToRender(true);
      }
    };
    void _dispatchUnitsAndAccount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, business]);

  // hook - to adjust onboarding step
  useEffect(() => {
    /* Validation if
     * business account is been created
     * and has supplier unit
     * and alimaAccount has a plan
     * and has more than one payment method
     * and RFC is validated
     * -- > redirect to home
     * */
    const hasPaymentMethod = alimaAccount?.paymentMethods.length > 0;
    const hasPaymentAcc = hasPaymentMethod
      ? alimaAccount?.paymentMethods[0]?.paymentType?.toUpperCase() === "CARD"
        ? alimaAccount?.paymentMethods[0]?.stripeCards?.length > 0 // IF Card check if has card
        : !!alimaAccount?.paymentMethods[0]?.transferAccount // IF Transfer check if has account
      : false;
    if (
      (business.businessType &&
        units.length > 0 &&
        alimaAccount?.account &&
        hasPaymentAcc &&
        legal.satRfc &&
        sessionToken) ||
      onboardingStep === ONBOARDING_STEPS.REDIRECTED
    ) {
      setOnboardingStep(ONBOARDING_STEPS.DONE);
      return;
    }
    /* Validation if
     * business account is been created
     * and has supplier unit
     * and alimaAccount has a plan
     * -- > redirect to payment
     * */
    if (
      business.businessType &&
      units.length > 0 &&
      alimaAccount?.account &&
      sessionToken
    ) {
      setOnboardingStep(ONBOARDING_STEPS.PAYMENT_METHOD);
      return;
    }
    /* Validation if
     * Business account is created
     *  and Supplier unit is there
     *  and no plan is selected
     *  -- > redirect to plan selection
     * */
    if (business.businessType && units.length > 0 && !alimaAccount?.account) {
      setOnboardingStep(ONBOARDING_STEPS.PLAN_SELECTION);
      return;
    }

    /* Validation if
     * Only business account is created
     *  and no supplier unit
     * -- > redirect to supplier unit
     * */
    if (business.businessType && units.length === 0) {
      setOnboardingStep(ONBOARDING_STEPS.SUPPLIER_UNIT);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, business, units, alimaAccount]);

  // handlers

  const handleBusinessAccSuccess = (flag: boolean) => {
    // if business account is created, go to unit onboarding
    setOnboardingStep(ONBOARDING_STEPS.SUPPLIER_UNIT);
  };

  const handleSupplierUnitSuccess = (flag: boolean) => {
    // if supplier unit is created, go to done
    setOnboardingStep(ONBOARDING_STEPS.PLAN_SELECTION);
  };

  const handlePlanSelectionSuccess = (flag: boolean) => {
    // if plan is selected, go to payment method
    setOnboardingStep(ONBOARDING_STEPS.PAYMENT_METHOD);
  };

  const handlePaymentMethodSuccess = (flag: boolean) => {
    // if plan is selected, go to done
    setOnboardingStep(ONBOARDING_STEPS.DONE);
  };

  const handleOnContinue = async () => {
    await delay(500);
    setOnboardingStep(ONBOARDING_STEPS.REDIRECTED);
    track("sign_up", {
      visit: window.location.toString(),
      page: "Onboarding",
      section: "Modal",
    });
    dispatch(getBusinessAccount(sessionToken || ""));
    navigate(PATH_APP.root);
  };

  return (
    <>
      {(!sessionToken || !readyToRender) && <LoadingProgress />}
      {sessionToken && readyToRender && (
        <RootStyle title="Registro Negocio | Alima">
          <AuthLayout pageName="Onboarding" />

          <MHidden width="mdDown">
            <SectionStyle>
              <Typography variant="h4" sx={{ px: 5, mt: 10 }}>
                Consigue nuevos clientes.
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ pl: 5, pr: 5, mt: 3, mb: 1 }}
              >
                Aumenta tu presencia digital y deja nuevos clientes te
                encuentren.
              </Typography>
              <Box sx={{ px: 6 }}>
                <img
                  alt="onboard-business"
                  className="lazyload blur-up"
                  src="/static/assets/illustrations/increase_sales.jpg"
                  style={{ borderRadius: "16px" }}
                />
              </Box>
            </SectionStyle>
          </MHidden>

          <Container>
            <ContentStyle>
              {/* Business Account Info onboarding */}
              {onboardingStep === ONBOARDING_STEPS.BUSINESS_ACCOUNT ? (
                <BusinessOnboardingView
                  onSuccessCallback={handleBusinessAccSuccess}
                />
              ) : null}

              {/* Supplier Unit Onboarding */}
              {onboardingStep === ONBOARDING_STEPS.SUPPLIER_UNIT ? (
                <SupplierUnitOnboardingView
                  onSuccessCallback={handleSupplierUnitSuccess}
                />
              ) : null}

              {/* Plan selection Onboarding */}
              {onboardingStep === ONBOARDING_STEPS.PLAN_SELECTION ? (
                <PlanSelectionOnboardingView
                  onSuccessCallback={handlePlanSelectionSuccess}
                />
              ) : null}

              {/* Payment Method Onboarding */}

              {onboardingStep === ONBOARDING_STEPS.PAYMENT_METHOD
                ? alimaAccount.paymentMethods && (
                    <PaymentInfoOnboardingView
                      onSuccessCallback={handlePaymentMethodSuccess}
                      paymentMethod={alimaAccount.paymentMethods[0]}
                    />
                  )
                : null}

              {/* Help button */}
              <FixedAddButton
                onClick={() => {
                  track("select_content", {
                    visit: window.location.toString(),
                    page: "Onboarding",
                    section: "HelpBottomButton",
                  });
                  window.open(PATHS_EXTERNAL.supportAlimaWA, "_blank");
                }}
                buttonIcon={questionMarkFill}
                buttonMsg="Ayuda"
                iconButtonSx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.secondary,
                  boxShadow: theme.shadows[2],
                }}
              />
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
      {/* confirmation dialog */}
      <BasicDialog
        open={onboardingStep === ONBOARDING_STEPS.DONE}
        title="Tu cuenta se creó correctamente."
        msg="¡A partir de ahora podrás user Alima para gestionar tus ventas y operación!"
        continueAction={{
          active: true,
          msg: "Continuar",
          actionFn: handleOnContinue,
        }}
        // backAction={{active: true, msg: "Regresar", actionFn: () => {}}}
        closeMark={false}
      />
    </>
  );
}
