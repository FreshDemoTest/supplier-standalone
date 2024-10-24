import { useEffect } from "react";
// hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../redux/store";
// components
import BusinessAccountSection, {
  BusinessAccountSectionProps,
} from "./BusinessAccountSection";
import ProgressBarSection, {
  ProgressBarSectionProps,
} from "./ProgressBarSection";
import { UnitsSectionProps } from "./UnitsSection";
import LoadingProgress from "../LoadingProgress";
// routes
import { PATH_APP } from "../../routes/paths";
// utils
import { isAllowedTo } from "../../utils/permissions";
import track from "../../utils/analytics";
// domain
import { AllowedType } from "../../domain/auth/AccountPermissions";
import DataInsightsSection from "./DataInsightsSection";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

type HomeViewProps = BusinessAccountSectionProps &
  ProgressBarSectionProps &
  UnitsSectionProps & {
    permissionsLoaded: boolean;
    allowed: AllowedType | undefined;
  };

const HomeView: React.FC<HomeViewProps> = ({
  businessName,
  businessId,
  userName,
  createBusinessAccount,
  createUnit,
  createCatalog,
  createLegal,
  createBilling,
  permissionsLoaded,
  allowed,
}) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading: isAccountLoading } = useAppSelector(
    (state) => state.account
  );
  // permission vars
  const allowHomeView = isAllowedTo(
    allowed?.unitPermissions,
    "usersadmin-home-view"
  );

  // registration shown until completed
  const notValidatedYet =
    !createBusinessAccount || !createUnit || !createBilling || !createLegal;
  const isRegistrationProgressDone = !notValidatedYet;
  const finishedSetup =
    createBusinessAccount &&
    createUnit &&
    createCatalog &&
    createBilling &&
    createLegal;

  // Internal Home Routing - redirect to orders if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowHomeView && isRegistrationProgressDone) {
      navigate(PATH_APP.orden.list);
      enqueueSnackbar("No tienes acceso a la Página de inicio", {
        variant: "warning",
      });
      track("screen_view", {
        visit: window.location.toString(),
        page: "Home",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowHomeView, isRegistrationProgressDone]);

  return (
    <>
      {isAccountLoading && !permissionsLoaded && <LoadingProgress />}
      {!isAccountLoading && permissionsLoaded && (
        <>
          {/* Business Account  */}
          <BusinessAccountSection
            businessName={businessName}
            userName={userName}
          />

          {/* Registration progress */}
          {!finishedSetup && (
            <ProgressBarSection
              createBusinessAccount={createBusinessAccount}
              createUnit={createUnit}
              createCatalog={createCatalog}
              createLegal={createLegal}
              createBilling={createBilling}
            />
          )}

          {/* Data Insights placeholders */}
          <DataInsightsSection businessId={businessId || ""} />
        </>
      )}
    </>
  );
};

export default HomeView;
