import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
// material
import { Icon } from "@iconify/react";
import { alpha, styled } from "@mui/material/styles";
import {
  Box,
  Link,
  Stack,
  Drawer,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
// assets
import collapseFill from "@iconify/icons-eva/arrow-left-outline";
import unCollapseFill from "@iconify/icons-eva/arrow-down-fill";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// routes
import { PATH_APP } from "../../routes/paths";
// components
import { LogoAlter } from "../../components/Logo";
import MyAvatar from "../../components/MyAvatar";
import Scrollbar from "../../components/Scrollbar";
import NavSection from "../../components/NavSection";
import MHidden from "../../components/extensions/MHidden";
import sidebarMenuOptions from "./SideMenuOptions";
import { getSupplierAlimaAccountSaasConfig } from "../../redux/slices/account";
import { verifyAvailableSections } from "../../utils/permissions";
import { UIVerifiedMenuOption } from "../../domain/auth/UIVerifications";

//

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const COLLAPSE_WIDTH = 84;

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("lg")]: {
    flexShrink: 0,
    transition: theme.transitions.create("width", {
      duration: theme.transitions.duration.complex,
    }),
  },
}));

const AccountStyle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 2.5),
  borderRadius: theme.shape.borderRadius,
  borderColor: alpha(theme.palette.primary.main, 0.5),
  borderWidth: 1,
  borderStyle: "solid",
  backgroundColor: theme.palette.primary.dark,
}));

// ----------------------------------------------------------------------

type DashboardSidebarProps = {
  isOpenSidebar: boolean;
  onCloseSidebar: (event?: any, reason?: string) => void;
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpenSidebar,
  onCloseSidebar,
}) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { user, sessionToken } = useAuth();
  const { business, saasConfig } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const [displayedSections, setDisplayedSections] = useState<
    Array<UIVerifiedMenuOption>
  >([]);
  const [collapseMode, setCollapseMode] = useState<boolean>(false);
  const [isCollapse, setIsCollapse] = useState<boolean>(false);

  const {
    onToggleCollapse,
    collapseClick,
    collapseHover,
    onHoverEnter,
    onHoverLeave,
  }: any = {
    onToggleCollapse: () => {
      // console.log('clicking to collapse');
      setIsCollapse(!collapseMode);
      setCollapseMode(!collapseMode);
    },
    collapseClick: false,
    collapseHover: false,
    onHoverEnter: () => {
      if (isCollapse && collapseMode) {
        // console.log('should be expanding!');
        setIsCollapse(false);
      }
    },
    onHoverLeave: () => {
      if (!isCollapse && collapseMode) {
        // console.log('should be contract!');
        setIsCollapse(true);
      }
    },
  };

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // onMounted Sections
  useEffect(() => {
    const _sects = sidebarMenuOptions.default;
    if (!saasConfig || !saasConfig.config?.sections) {
      setDisplayedSections(_sects);
    } else {
      // when saasConfig is ready
      const sdSects = verifyAvailableSections(_sects, saasConfig);
      setDisplayedSections(sdSects);
    }
  }, [saasConfig]);

  // on dispatch ready
  useEffect(() => {
    if (!sessionToken) return;
    dispatch(getSupplierAlimaAccountSaasConfig(sessionToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        "& .simplebar-content": {
          height: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          ...(isCollapse && {
            alignItems: "center",
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box component={RouterLink} to="/" sx={{ display: "inline-flex" }}>
            <LogoAlter width={60} height={60} />
          </Box>

          <MHidden width="lgDown">
            {!isCollapse && (
              <IconButton onClick={onToggleCollapse}>
                {collapseMode && <Icon icon={collapseFill} color="white" />}
                {!collapseMode && <Icon icon={unCollapseFill} color="white" />}
              </IconButton>
            )}
          </MHidden>
        </Stack>

        {isCollapse ? (
          <MyAvatar sx={{ mx: "auto", mb: 2 }} />
        ) : (
          <Link
            underline="none"
            component={RouterLink}
            to={PATH_APP.account.root}
          >
            <AccountStyle>
              <MyAvatar />
              <Box sx={{ ml: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.getContrastText(
                      theme.palette.primary.dark
                    ),
                  }}
                >
                  {user?.displayName || "Nombre"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.getContrastText(
                      theme.palette.primary.dark
                    ),
                  }}
                >
                  {business?.businessName || "."}
                </Typography>
              </Box>
            </AccountStyle>
          </Link>
        )}
      </Stack>
      {/* Side bar config */}
      <NavSection
        navConfig={displayedSections}
        isShow={!isCollapse}
        {...{ sx: { mt: 6 } }}
      />
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: {
          lg: isCollapse ? COLLAPSE_WIDTH : DRAWER_WIDTH,
        },
        ...(collapseClick && {
          position: "absolute",
        }),
      }}
    >
      {/* No Mobile version */}

      {/* Desktop version*/}
      <MHidden width="lgDown">
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: theme.palette.primary.dark, //'background.default'
              ...(isCollapse && {
                width: COLLAPSE_WIDTH,
              }),
              ...(collapseHover && {
                borderRight: 0,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
                boxShadow: (theme) => theme.shadows[14],
                bgcolor: (theme) =>
                  alpha(theme.palette.background.default, 0.88),
              }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>
    </RootStyle>
  );
};

export default DashboardSidebar;
