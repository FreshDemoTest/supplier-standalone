import { Link as RouterLink } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  Stack,
  Container,
  Typography,
  // Link,
  IconButton,
  Grid,
} from "@mui/material";
import Cached from "@mui/icons-material/Cached";
// routes
// import { PATH_AUTH } from "../../routes/paths";
// hooks
// layouts
import AuthLayout from "../../layouts/AuthLayout";
// components
import Page from "../../components/Page";
import LoginForm from "../../components/auth/LoginForm";
import Logo from "../../components/Logo";
import MHidden from "../../components/extensions/MHidden";
// import AuthFirebaseSocials from '../../components/authentication/AuthFirebaseSocial';
// config
import { pwaRelease } from "../../config";
// utils
import { mixtrack } from "../../utils/analytics";
import InstallPWAButton from "../../components/InstallPWAButton";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 464,
  display: "flex",
  flexDirection: "column",
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

export default function Login() {
  //   const { method } = useAuth();
  const handleHotReload = () => {
    window.location.reload();
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  };

  // const handleRegisterRedirect = () => {
  //   mixtrack("register_redirect", {
  //     visit: window.location.toString(),
  //     page: "Login",
  //     section: "",
  //   });
  // };
  return (
    <RootStyle title="Inicia Sesión | Alima">
      <MHidden width="mdDown">
        <SectionStyle>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: "inline-flex", paddingLeft: 5 }}
            onClick={() => {
              mixtrack("alima_logo", {
                visit: window.location.toString(),
                page: "Login",
                section: "AuthLayout",
              });
            }}
          >
            <Logo height={100} width={160} />
          </Box>
          <Typography variant="h4" sx={{ px: 5, mt: 5 }}>
            Crea usuarios y organiza a todo tu personal por Centros de
            Distribución.
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ pl: 5, pr: 6, mt: 4, mb: 5 }}
          >
            Crea perfiles con diferentes permisos en cada CEDIS que tengas:
            Administrador, Gerente, Contador, Almacenista, Operador y más.
          </Typography>
          <img
            className="lazyload blur-up"
            src="/static/assets/illustrations/manage_warehouse.jpg"
            alt="login"
          />

          {/* Version */}
          <Box
            position={"fixed"}
            sx={{ bottom: 20, display: "flex", left: "10%" }}
          >
            <Typography
              variant="caption"
              align="center"
              color={"text.secondary"}
            >
              {`© alima - ${pwaRelease} `} &nbsp;
              <IconButton
                sx={{ p: 0, fontSize: "inherit" }}
                onClick={handleHotReload}
              >
                <Cached color="disabled" />
              </IconButton>
            </Typography>
          </Box>
        </SectionStyle>
      </MHidden>
      <MHidden width="mdUp">
        <AuthLayout pageName="Login" />
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Entra a tu cuenta de Alima - Seller
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 5 }}>
                {" "}
                Inicia sesión con tu correo electrónico.
              </Typography>
            </Box>
          </Stack>

          {/* {method === 'firebase' && <AuthFirebaseSocials />} */}

          {/* Email password login form */}
          <LoginForm />
          {/* <Box sx={{ mt: 2, typography: "body1" }}>
            ¿No tienes cuenta? &nbsp;
            <Link
              underline="none"
              variant="subtitle1"
              component={RouterLink}
              to={PATH_AUTH.register}
              onClick={handleRegisterRedirect}
            >
              Regístrate
            </Link>
          </Box> */}
          {/* end email login */}

          {/* Install the App - desktop*/}
          <MHidden width="mdDown">
            <Grid container justifyContent={"center"} sx={{ pt: 24 }}>
              {/* <Grid item md={1} /> */}
              <Grid item md={12}>
                <InstallPWAButton />
              </Grid>
            </Grid>
          </MHidden>
        </ContentStyle>
      </Container>

      {/* Install the App - mobile*/}
      <MHidden width="mdUp">
        <Box
          position={"fixed"}
          sx={{
            bottom: 48,
            width: "100%",
          }}
        >
          <Grid container>
            <Grid item xs={3} />
            <Grid item xs={6}>
              <InstallPWAButton />
            </Grid>
          </Grid>
        </Box>
      </MHidden>
      {/* Powered by Alima */}
      <MHidden width="mdUp">
        <Box
          position={"fixed"}
          sx={{
            bottom: 4,
            width: "100%",
          }}
        >
          <Grid container justifyContent={"center"}>
            <Grid item xs={4} sm={5} md={3}></Grid>
            <Grid item xs={5} sm={5} md={6}>
              <Typography
                variant="caption"
                align="center"
                color={"text.secondary"}
                // sx={{ ml: 4 }}
              >
                {`© alima - ${pwaRelease} `} &nbsp;
                <IconButton
                  sx={{ p: 0, fontSize: "inherit" }}
                  onClick={handleHotReload}
                >
                  <Cached color="disabled" />
                </IconButton>
              </Typography>
            </Grid>
            <Grid item xs={3} sm={2} md={3}></Grid>
          </Grid>
        </Box>
      </MHidden>
    </RootStyle>
  );
}
