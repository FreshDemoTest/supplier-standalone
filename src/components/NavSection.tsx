// import { Icon } from '@iconify/react';
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import LockFill from "@mui/icons-material/Lock";
// import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
// import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
// material
import { alpha, useTheme, styled } from "@mui/material/styles";
import {
  Box,
  List,
  // Collapse,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";

// ----------------------------------------------------------------------
// const ListSubHeaderStickyComp: React.FC<PropsWithChildren> = (props) => {
//   return (
//     <ListSubheader disableSticky disableGutters {...props}>
//       {props.children}
//     </ListSubheader>
//   );
// };

// const ListSubheaderStyle = styled(ListSubHeaderStickyComp)(({ theme }) => ({
//   ...theme.typography.subtitle2,
//   marginTop: theme.spacing(3),
//   marginBottom: theme.spacing(2),
//   paddingLeft: theme.spacing(5),
//   color: theme.palette.text.secondary,
// }));

const ListItemStyle = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: "relative",
  textTransform: "capitalize",
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.getContrastText(theme.palette.primary.dark),
  "&:before": {
    top: 0,
    right: 0,
    width: 3,
    bottom: 0,
    content: "''",
    display: "none",
    position: "absolute",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.palette.info.main,
  },
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LgListItemIconStyle = styled(ListItemIcon)(({ theme }) => ({
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(0),
  paddingLeft: theme.spacing(1),
  height: 52,
}));

// ----------------------------------------------------------------------

type ItemProps = {
  title: string;
  path: string;
  display?: Boolean;
  icon?: JSX.Element;
  lgIcon?: JSX.Element;
  info?: JSX.Element;
  children?: Array<ItemProps> | null;
  available?: Boolean;
};

type NavItemProps = {
  isShow: Boolean;
  item: ItemProps;
};

const NavItem: React.FC<NavItemProps> = ({ item, isShow }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { title, path: origPath, icon, lgIcon, info, available = true } = item; // children

  const path = origPath.split("#")[0];
  const isActiveRoot = path
    ? !!matchPath({ path, end: true }, pathname)
    : false;

  const handleRedirect = (localpath: string) => {
    navigate(localpath);
  };

  const activeRootStyle = {
    color: theme.palette.getContrastText(theme.palette.primary.dark),
    fontWeight: theme.typography.fontWeightMedium,
    bgcolor: alpha(theme.palette.primary.main, 0.5),
    "&:before": { display: "block" },
  };

  return (
    <ListItemStyle
      onClick={() => {
        if (available) {
          handleRedirect(path);
        }
      }}
      sx={{
        ...(isActiveRoot && activeRootStyle),
      }}
    >
      {/* Expanded NavItem */}
      {isShow && (
        <ListItemIconStyle sx={{ color: theme.palette.common.white }}>
          {icon}
        </ListItemIconStyle>
      )}
      {isShow && (
        <>
          <ListItemText disableTypography primary={title} />
          {info}
          {!available ? (
            <ListItemIconStyle>
              <LockFill
                sx={{
                  color: theme.palette.grey[300],
                  height: 18,
                  width: 18,
                }}
              />
            </ListItemIconStyle>
          ) : null}
        </>
      )}
      {/* Collapesed NavItem */}
      {!isShow && (
        <LgListItemIconStyle sx={{ color: theme.palette.common.white }}>
          {lgIcon}
        </LgListItemIconStyle>
      )}
    </ListItemStyle>
  );
};

type NavSectionItemProps = {
  subheader: string;
  items: Array<ItemProps>;
};

type NavSectionProps = {
  isShow?: Boolean;
  navConfig: Array<NavSectionItemProps>;
  other?: Array<any>;
};

const NavSection: React.FC<NavSectionProps> = ({
  navConfig,
  isShow = true,
  ...other
}) => {
  return (
    <Box {...other}>
      {navConfig.map((list) => {
        const { subheader, items } = list;
        // const emptySection = items.map((j) => j.display).every((v) => !v);
        return (
          <List key={subheader} disablePadding>
            {/* {isShow && !emptySection && (
              <ListSubheaderStyle children={subheader.toUpperCase()} />
            )} */}
            {items.map((item) => {
              return <NavItem key={item.title} item={item} isShow={isShow} />;
            })}
          </List>
        );
      })}
    </Box>
  );
};

export default NavSection;
