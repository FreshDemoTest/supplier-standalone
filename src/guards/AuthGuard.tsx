import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// hooks
import useAuth from "../hooks/useAuth";
// pages
import Login from "../pages/auth/Login";
import Verification from "../pages/auth/Verification";
import usePermissions from "../hooks/usePermissions";
import { PATH_APP } from "../routes/paths";
import { useAppSelector } from "../redux/store";

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: any;
};

/**
 * AuthGuard validates if an
 * @param AuthGuardProps
 * @returns
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, verification } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string>();
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = usePermissions();
  const { business, businessLoaded } = useAppSelector(
    (state) => state.account
  );

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  } else {
    if (!verification.isVerified) {
      return <Verification />;
    }
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(undefined);
    return <Navigate to={requestedLocation} />;
  }

  if (permissionsLoaded) {
    // if business is not onboarded, redirect to onboarding page
    if (businessLoaded && business.businessType === undefined && pathname !== PATH_APP.account.onboarding) {
      return <Navigate to={PATH_APP.account.onboarding} />;
    }
    // Redirect to Account deleted page if user is deleted
    if (!allowed || !allowed.accountPermission) {
      //  skip if already on the account deleted page
      // or in the alima billing page
      if (
        pathname !== PATH_APP.accountDeleted &&
        pathname !== PATH_APP.alimaAccount &&
        pathname !== PATH_APP.account.onboarding &&
        businessLoaded
      ) {
        navigate(PATH_APP.accountDeleted);
      }
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
