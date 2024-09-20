import { useRef, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
// hooks
import useAuth from "./useAuth";
import { useAppDispatch, useAppSelector } from "../redux/store";
// redux
import { getPermissions } from "../redux/slices/permission";
// domain
import useIsMountedRef from "./useIsMountedRef";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function usePermissions() {
  const fetched = useRef(false);
  const sentMsg = useRef(false);
  const isMounted = useIsMountedRef();
  const { sessionToken, getSessionToken, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const { permissions, allowed, loaded, error, isLoading } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // hook - update session token
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!sessionToken) {
      getSessionToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, getSessionToken]);

  // Initialization
  useEffect(() => {
    if (!sessionToken) return;
    if (!isMounted.current) return;
    // fetch permissions
    if (!fetched.current) {
      dispatch(getPermissions(sessionToken));
      fetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  if (!permissions && error.active) {
    if (!sentMsg.current && isBusinessOnboarded) {
      enqueueSnackbar(
        "Hay un error, no se pudieron acceder a los permisos de tu cuenta.",
        { variant: "error" }
      );
      sentMsg.current = true;
    }
  }

  return {
    loaded: loaded && !isLoading,
    allowed,
  };
}
