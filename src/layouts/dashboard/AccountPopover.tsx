import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import homeFill from "@iconify/icons-eva/home-outline";
import personFill from "@iconify/icons-eva/person-outline";
import settingsFill from "@iconify/icons-eva/settings-outline";
import planFill from "@iconify/icons-eva/credit-card-outline";
import questionMarkFill from "@iconify/icons-eva/question-mark-circle-outline";
import listFillIcon from "@iconify/icons-ic/baseline-list-alt";
import peopleFillIcon from "@iconify/icons-ic/people-outline";
import categoryFillIcon from "@iconify/icons-ic/outline-category";
import descriptionFillIcon from "@iconify/icons-ic/outline-description";
import quoteFillIcon from "@iconify/icons-ic/outline-request-quote";
import analyticsFillIcon from "@iconify/icons-ic/outline-analytics";
import LockFill from "@mui/icons-material/Lock";
import storeIcon from "@iconify/icons-ic/store";
import { useNavigate } from "react-router-dom";
// material
import {
  Button,
  Box,
  Divider,
  MenuItem,
  Typography,
  IconButton,
  debounce,
  useTheme,
} from "@mui/material";
import Cached from "@mui/icons-material/Cached";
// routes
import { PATHS_EXTERNAL, PATH_APP } from "../../routes/paths";
// hooks
import useAuth from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useIsMountedRef from "../../hooks/useIsMountedRef";
// redux
import { resetRootReducer } from "../../redux/rootReducer";
// components
import MyAvatar from "../../components/MyAvatar";
import MenuPopover from "../../components/MenuPopover";
import { pwaRelease } from "../../config";
// utils
import track from "../../utils/analytics";
import {
  isAllowedTo,
  verifyAvailableMobileSections,
} from "../../utils/permissions";
import { getSupplierAlimaAccountSaasConfig } from "../../redux/slices/account";

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: "Home",
    icon: homeFill,
    linkTo: PATH_APP.root,
  },
  {
    label: "Clientes",
    icon: peopleFillIcon,
    linkTo: PATH_APP.client.root,
  },
  {
    label: "Catálogo",
    icon: categoryFillIcon,
    linkTo: PATH_APP.catalog.root,
  },
  {
    label: "Pedidos",
    icon: listFillIcon,
    linkTo: PATH_APP.orden.root,
  },
  {
    label: "Facturas",
    icon: descriptionFillIcon,
    linkTo: PATH_APP.invoice.root,
  },
  {
    label: "Pagos",
    icon: quoteFillIcon,
    linkTo: PATH_APP.payment.root,
  },
  {
    label: "Reportes",
    icon: analyticsFillIcon,
    linkTo: PATH_APP.report.root,
  },
  {
    label: "E-commerce B2B",
    icon: storeIcon,
    linkTo: PATH_APP.ecommerce.root,
  },
];

const HELPER_OPTIONS = [
  {
    label: "Configuración",
    icon: settingsFill,
    linkTo: PATH_APP.account.root,
  },
  {
    label: "Mi Perfil",
    icon: personFill,
    linkTo: PATH_APP.profile,
  },
  {
    label: "Suscripción Alima",
    icon: planFill,
    linkTo: PATH_APP.alimaAccount,
  },
  {
    label: "Ayuda",
    icon: questionMarkFill,
    linkTo: PATHS_EXTERNAL.supportAlimaWA,
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const { user, logout, sessionToken } = useAuth();
  const { business, saasConfig } = useAppSelector((state) => state.account);
  const { allowed } = useAppSelector((state) => state.permission);
  const [open, setOpen] = useState(false);
  const [displaySections, setDisplaySections] = useState<
    { label: string; icon: any; linkTo: string; available?: boolean }[]
  >([]);

  const allowEditAccount = isAllowedTo(
    allowed?.unitPermissions,
    "usersadmin-home-edit-account"
  );

  // on mounted
  useEffect(() => {
    track("select_content", {
      visit: window.location.toString(),
      page: "",
      section: "TopBar",
    });
  }, []);

  // on dispatch ready
  useEffect(() => {
    if (!sessionToken) return;
    if (saasConfig && saasConfig?.config?.sections) return;
    dispatch(getSupplierAlimaAccountSaasConfig(sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  // onMounted Sections
  useEffect(() => {
    if (!saasConfig || !saasConfig?.config?.sections) {
      setDisplaySections(
        MENU_OPTIONS.map((option) => ({ ...option, available: true }))
      );
    } else {
      // when saasConfig is ready
      const sdSects = verifyAvailableMobileSections(MENU_OPTIONS, saasConfig);
      setDisplaySections(sdSects);
    }
  }, [saasConfig]);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleClickMenuItem = async (linkTo: string) => {
    debounce(() => {
      if (linkTo.startsWith("http")) {
        window.open(linkTo, "_blank");
      } else {
        navigate(linkTo);
      }
      handleClose();
      track("select_content", {
        item: linkTo,
        visit: window.location.toString(),
        page: "",
        section: "TopBar",
      });
    }, 50)();
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetRootReducer(dispatch);
      navigate("/");
      handleReloadVersion();
      track("login", {
        visit: window.location.toString(),
        page: "",
        section: "TopBar",
      });
      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("No se pudo cerrar sesión.", { variant: "error" });
    }
  };

  const handleReloadVersion = () => {
    window.location.reload();
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          zIndex: 99,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
            },
          }),
        }}
      >
        <MyAvatar />
      </IconButton>
      <Box>
        <MenuPopover
          open={open}
          onClose={handleClose}
          anchorEl={anchorRef.current || undefined}
          sx={{
            width: 220,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Box sx={{ my: 1.5, px: 2.5 }}>
            <Typography variant="subtitle1" noWrap>
              {(user || { displayName: "" }).displayName}
            </Typography>
            <Typography variant="body2" noWrap>
              {business.businessName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
              {(user || { email: "" }).email}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {displaySections.map((option) => (
            <MenuItem
              key={option.label}
              onClick={() => {
                if (option.available) {
                  handleClickMenuItem(option.linkTo);
                }
              }}
              sx={{
                typography: "body2",
                py: 1,
                px: 2.5,
                color: "text.secondary",
              }}
            >
              <Box
                component={Icon}
                icon={option.icon}
                sx={{
                  mr: 2,
                  width: 24,
                  height: 24,
                }}
              />
              {option.label}
              {!option.available ? (
                <Box>
                  <LockFill
                    sx={{
                      mt: 0.5,
                      ml: 2,
                      color: theme.palette.text.secondary,
                      width: 16,
                      height: 16,
                    }}
                  />
                </Box>
              ) : null}
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {HELPER_OPTIONS.filter((option) => {
            if (
              [PATH_APP.account.root, PATH_APP.alimaAccount].includes(
                option.linkTo
              )
            ) {
              return allowEditAccount;
            } else {
              return true;
            }
          }).map((option) => (
            <MenuItem
              key={option.label}
              onClick={() => handleClickMenuItem(option.linkTo)}
              sx={{
                typography: "body2",
                py: 1,
                px: 2.5,
                color: "text.secondary",
              }}
            >
              <Box
                component={Icon}
                icon={option.icon}
                sx={{
                  mr: 2,
                  width: 24,
                  height: 24,
                }}
              />

              {option.label}
            </MenuItem>
          ))}

          <Box sx={{ p: 2, pt: 1.5 }}>
            <Button fullWidth variant="outlined" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Box>

          <Divider sx={{ mt: 0.5 }} />
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              align="center"
              color={"text.secondary"}
            >
              {`© alima - ${pwaRelease} `} &nbsp;
              <IconButton
                sx={{ p: 0, fontSize: "inherit" }}
                onClick={handleReloadVersion}
              >
                <Cached color="disabled" />
              </IconButton>
            </Typography>
          </Box>
        </MenuPopover>
      </Box>
    </>
  );
}
