import { MouseEventHandler, useEffect, useRef, useState } from "react";
// material
import { alpha, styled } from "@mui/material/styles";
import { Box, Stack, AppBar, Toolbar, Button } from "@mui/material";
// routes
import {
  PATH_APP,
  pathsWithBack,
  pathsWithoutUnitSelector,
} from "../../routes/paths";
// redux
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getUnits,
  getBusinessAccount,
  setActiveUnitSuccess,
  getSupplierAlimaAccount,
} from "../../redux/slices/account";
// hooks
import useCollapseDrawer from "../../hooks/useCollapseDrawer";
import { useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
// components
import AccountPopover from "./AccountPopover";
import BackLayout from "../BackLayout";
import UnitSelectPopover, { ListUnitOptions } from "./UnitSelectPopover";
import BasicDialog from "../../components/navigation/BasicDialog";
import LoadingProgress from "../../components/LoadingProgress";
// domain
import { UnitType } from "../../domain/account/SUnit";
import { delay } from "../../utils/helpers";
import { getUnitsAllowed } from "../../utils/permissions";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const COLLAPSE_WIDTH = 84;

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 64;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up("lg")]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
  },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up("lg")]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 3),
  },
}));

// ----------------------------------------------------------------------

type DashboardNavbarProps = {
  onOpenSidebar: MouseEventHandler;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onOpenSidebar }) => {
  const fetchedUnits = useRef(false);
  const fetchedBAccount = useRef(false);
  const { isCollapse } = useCollapseDrawer();
  const { sessionToken, sessionTokenResult, getSessionToken } = useAuth();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allowed } = usePermissions();
  const {
    business,
    units: AllUnits,
    activeUnit,
    isLoading: isUnitsLoading,
  } = useAppSelector((state) => state.account);
  // filtered units
  const [units, setUnits] = useState<UnitType[]>([]);

  // filter branches
  useEffect(
    () => {
      if (AllUnits.length > 0) {
        const _units = getUnitsAllowed(
          AllUnits,
          allowed?.unitPermissions
        ).filter((b: any) => !b.deleted);
        setUnits(_units);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [AllUnits, allowed]
  );

  // set a watch on sessionToken
  const MINUTE_MS = 60000 * 60; // 60 mins

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !sessionTokenResult ||
        new Date(sessionTokenResult.expirationTime) < new Date()
      ) {
        console.log("session token expired, getting new one");
        getSessionToken();
      }
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hook - update session token
  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  // hooks
  useEffect(() => {
    if (sessionToken && business.businessType && units.length === 0) {
      if (fetchedUnits.current) return;
      dispatch(getUnits(business, sessionToken));
      fetchedUnits.current = true;
    }
    if (sessionToken && !business.businessType) {
      if (fetchedBAccount.current) return;
      dispatch(getBusinessAccount(sessionToken));
      dispatch(getSupplierAlimaAccount(sessionToken));
      fetchedBAccount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken, business]);

  // logic vars
  const showUnitSelector =
    (!pathsWithoutUnitSelector.includes(pathname) &&
      !pathname.includes(PATH_APP.account.unit.edit.replace(":unitId", "")) &&
      !pathname.includes(
        PATH_APP.catalog.price.editUpload.replace(":priceListId", "")
      ) &&
      !pathname.includes(
        PATH_APP.catalog.product.edit.replace(":productId", "")
      ) &&
      !pathname.includes(
        PATH_APP.catalog.price.editList.replace(":priceListId", "")
      ) &&
      !pathname.includes(PATH_APP.orden.edit.replace(":ordenId", ""))
      &&
      !pathname.includes(PATH_APP.invoice.reInvoice.replace(":ordenId", ""))
      &&
      !pathname.includes(PATH_APP.orden.details.replace(":ordenId", ""))
      &&
      !pathname.includes(PATH_APP.report.details.replace(":pluginSlug", ""))) ||
    (pathname.includes(PATH_APP.catalog.list) && hash === "#prices") ||
    (pathname.includes(PATH_APP.catalog.list) && hash === "#stock");

  const [openSelectUnitDiag, setOpenSelectUnitDiag] = useState(false);

  // handlers
  const handleSelectUnit = (unit: UnitType) => {
    dispatch(setActiveUnitSuccess(unit));
    setOpenSelectUnitDiag(false);
  };

  // routing logic
  useEffect(() => {
    if (openSelectUnitDiag && units.length === 0) {
      // if no units to select from, go to home
      // navigate(PATH_APP.root);
      console.log("no units to select from, can't continue");
    } else if (
      openSelectUnitDiag &&
      units.length === 1 &&
      activeUnit === undefined
    ) {
      // if only one unit, select it and close dialog
      dispatch(setActiveUnitSuccess(units[0]));
      setOpenSelectUnitDiag(false);
    } else {
      if (showUnitSelector && activeUnit === undefined) {
        // if no active unit, open dialog
        setOpenSelectUnitDiag(true);
      }
    }
  }, [
    openSelectUnitDiag,
    units,
    navigate,
    dispatch,
    activeUnit,
    showUnitSelector,
  ]);

  // backNavigation logic
  const showBackNav = pathsWithBack
    .map((p) => {
      const incp = pathname.includes(p.split(":")[0]);
      return incp;
    })
    .reduce((a: boolean, b: boolean) => a || b);

  return (
    <RootStyle
      sx={{
        ...(isCollapse && {
          width: { lg: `calc(100% - ${COLLAPSE_WIDTH}px)` },
        }),
      }}
    >
      {/* No selected dialog */}
      <BasicDialog
        open={openSelectUnitDiag}
        onClose={async () => {
          navigate(PATH_APP.root);
          await delay(500);
          setOpenSelectUnitDiag(false);
        }}
        title="CEDIS sin asignar"
        msg={
          units.length > 0
            ? "Selecciona un CEDIS para continuar."
            : isUnitsLoading
            ? ""
            : "No hay CEDIS disponibles."
        }
        closeMark={false}
      >
        {" "}
        <ListUnitOptions unitOptions={units} onSelect={handleSelectUnit} />
        {isUnitsLoading && (
          <LoadingProgress sx={{ mb: 3, px: 10 }} color="info" />
        )}
        {units.length === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <Button
              color="info"
              onClick={async () => {
                navigate(PATH_APP.root);
                await delay(500);
                setOpenSelectUnitDiag(false);
              }}
            >
              Regresar
            </Button>
          </Box>
        )}
      </BasicDialog>

      {/* BackNavigation shown only for allowed paths at pathsWithBack */}
      {/* {pathsWithBack.includes(pathname) && <BackLayout />} */}
      {showBackNav && <BackLayout />}

      {/* Toolbar */}
      <ToolbarStyle>
        <Box sx={{ flexGrow: 1 }}>
          {/* UnitSelectPopover shown only for allowed paths NOT at pathsWithoutUnitSelector */}
          {showUnitSelector && <UnitSelectPopover units={units} />}
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.5, sm: 1.5 }}
        >
          {/* <NotificationsPopover /> */}
          {/* <ContactsPopover /> */}
          <AccountPopover />
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
};

export default DashboardNavbar;
