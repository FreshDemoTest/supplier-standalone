// react
import { Icon } from "@iconify/react";
import homeFill from "@iconify/icons-eva/home-fill";
import listFillIcon from "@iconify/icons-ic/baseline-list-alt";
import peopleFillIcon from "@iconify/icons-ic/people";
import categoryFillIcon from "@iconify/icons-ic/outline-category";
// hooks
import { useLocation, useNavigate } from "react-router";
// material
import {
  AppBar,
  Box,
  Grid,
  Toolbar,
  Typography,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import MHidden from "../../components/extensions/MHidden";
import { useState } from "react";
import { PATH_APP } from "../../routes/paths";
import track from "../../utils/analytics";

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 0;
const APPBAR_MOBILE = 68;
const APPBAR_DESKTOP = 92;

const APPBAR_OPTIONS = [
  {
    label: "Inicio",
    key: "home",
    icon: homeFill,
    paths: [PATH_APP.root],
    linkTo: PATH_APP.root,
  },
  {
    label: "Catálogo",
    key: "catalog",
    icon: categoryFillIcon,
    paths: [
      PATH_APP.catalog.root,
      PATH_APP.catalog.list,
      PATH_APP.catalog.product.add,
      PATH_APP.catalog.product.edit,
      PATH_APP.catalog.price.addList,
      PATH_APP.catalog.price.editList,
    ],
    linkTo: PATH_APP.catalog.list + "#products",
  },
  {
    label: "Pedidos",
    key: "orden",
    icon: listFillIcon,
    paths: [
      PATH_APP.orden.add,
      PATH_APP.orden.root,
      PATH_APP.orden.list,
      PATH_APP.orden.edit,
      PATH_APP.orden.details,
    ],
    linkTo: PATH_APP.orden.root,
  },
  {
    label: "Clientes",
    key: "clientsupplier",
    icon: peopleFillIcon,
    paths: [
      PATH_APP.client.root,
      PATH_APP.client.list,
      PATH_APP.client.edit,
      PATH_APP.client.add.file,
      PATH_APP.client.add.form,
      PATH_APP.client.details,
    ],
    linkTo: PATH_APP.client.root,
  },
];

// ----------------------------------------------------------------------

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  backdropFilter: "blur(8px)",
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  top: "auto",
  bottom: 0,
  [theme.breakpoints.up("lg")]: {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
  },
}));

const BoxFloatBarStyled = styled(Box)(({ theme }) => ({
  height: "50px",
  width: "100%",
  marginTop: 0,
  backgroundColor: theme.palette.primary.main, // theme.palette.primary.dark,
  borderRadius: APPBAR_MOBILE / 2,
  boxShadow: theme.shadows[4],
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0, 5),
  },
  [theme.breakpoints.up("lg")]: {
    minHeight: APPBAR_DESKTOP,
  },
}));

// const ButtonAppBarStyled = styled(Button)(({ theme }) => ({
//   marginRight: theme.spacing(1),
//   color: theme.palette.text.primary
// }));

// ----------------------------------------------------------------------
const isSectionActive = (key: string, lpath: string) => {
  const sIdx = APPBAR_OPTIONS.find((opt) => opt.key === key);
  if (sIdx?.paths.includes(lpath) && key === "home") {
    return true;
  }
  if (
    sIdx?.paths
      .map((p: any) => lpath.includes(p))
      .reduce((a: boolean, b: boolean) => a || b) &&
    key === "catalog"
  ) {
    return true;
  }
  if (
    sIdx?.paths
      .map((p: any) => lpath.includes(p))
      .reduce((a: boolean, b: boolean) => a || b) &&
    key === "orden"
  ) {
    return true;
  }
  if (
    sIdx?.paths
      .map((p: any) => lpath.includes(p))
      .reduce((a: boolean, b: boolean) => a || b) &&
    key === "supplier"
  ) {
    return true;
  }
  if (
    sIdx?.paths
      .map((p: any) => lpath.includes(p))
      .reduce((a: boolean, b: boolean) => a || b) &&
    key === "clientsupplier"
  ) {
    return true;
  }
  return false;
};

// ----------------------------------------------------------------------

const BottomAppBar = () => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAllowed, setIsAllowed] = useState(true);

  //   const { isAllowed } = useSelector(
  //     state => state.user,
  //   );

  //   useEffect(() => {
  //     const _runAccDel = async () => {
  //       const idToken = await firebase.auth().currentUser.getIdToken(true);
  //       dispatch(getAIsAllowed(idToken));
  //     };
  //     _runAccDel();
  //   }, [dispatch]);

  const goToSection = (sectionPath: string) => {
    navigate(sectionPath);
    track("screen_view", {
      visit: window.location.toString(),
      page: "",
      section: "BottomAppBar",
      goTo: sectionPath,
    });
  };

  // [TODO]: implement disabled with isAllowed
  return (
    <AppBarStyled position="fixed">
      <MHidden width="lgUp">
        {isAllowed && (
          <ToolbarStyled>
            <BoxFloatBarStyled>
              <Grid container>
                {APPBAR_OPTIONS.map((opt) => (
                  <Grid item xs={3} sm={3} md={3} key={opt.key}>
                    <Box textAlign={"center"}>
                      <Box
                        sx={{
                          backgroundColor: isSectionActive(opt.key, pathname)
                            ? alpha(theme.palette.primary.dark, 0.9) // alpha(theme.palette.primary.main, 0.9)
                            : "none",
                          maxWidth: "60%",
                          borderRadius: theme.spacing(1),
                          ml: "20%",
                          mt: "2px",
                          pt: "2px",
                          height: "45px",
                        }}
                        onClick={() => goToSection(opt.linkTo)}
                      >
                        <Icon
                          icon={opt.icon}
                          width={24}
                          height={24}
                          style={{
                            color: theme.palette.common.white,
                            fontWeight: theme.typography.fontWeightMedium,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            mt: theme.spacing(-1),
                            pt: theme.spacing(0),
                            fontSize: "0.65rem",
                            color: theme.palette.common.white,
                            fontWeight: theme.typography.fontWeightMedium,
                          }}
                        >
                          {opt.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </BoxFloatBarStyled>
          </ToolbarStyled>
        )}
      </MHidden>
    </AppBarStyled>
  );
};

export default BottomAppBar;
