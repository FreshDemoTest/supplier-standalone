import { Link as RouterLink } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  Link,
  Container,
  Typography,
  IconButton,
} from "@mui/material";
import Cached from "@mui/icons-material/Cached";
// hooks
// routes
import { PATHS_EXTERNAL, PATH_AUTH } from "../../routes/paths";
// layouts
import AuthLayout from "../../layouts/AuthLayout";
// components
import Page from "../../components/Page";
import MHidden from "../../components/extensions/MHidden";
import RegisterForm from "../../components/auth/RegisterForm";
import { pwaRelease } from "../../config";
import track from "../../utils/analytics";

// import AuthFirebaseSocials from '../../components/authentication/AuthFirebaseSocial';

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

export default function Register() {
  // const { method } = useAuth();
  const handleHotReload = () => {
    window.location.reload();
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  };

  const handleLoginRedirect = () => {
    track("screen_view", {
      visit: window.location.toString(),
      page: "Register",
      section: "",
    });
  };
  return (
    <RootStyle title="Registro | Alima">
      <AuthLayout pageName="Register">
        ¿Ya tienes una cuenta? &nbsp;
        <Link
          underline="none"
          variant="subtitle2"
          component={RouterLink}
          to={PATH_AUTH.login}
          onClick={handleLoginRedirect}
        >
          Inicia Sesión
        </Link>
      </AuthLayout>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h4" sx={{ pl: 5, pr: 6, mt: 10 }}>
            Optimizando las operaciones de tu negocio.
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ pl: 5, pr: 7, mt: 4, mb: 5 }}
          >
            Administra todos tus pedidos, gestiona tus productos, listas de
            preicos, automatiza tus facturas y consigue nuevos clientes.
            <br />
            Para que tú solo te preocupes por seguir creciendo.
          </Typography>
          <Box sx={{ px: 8 }}>
            <img
              className="lazyload blur-up"
              alt="register"
              src="/static/assets/illustrations/kitchen_team.jpg"
              style={{ borderRadius: "16px" }}
            />
          </Box>
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
              {`${pwaRelease} `} &nbsp;
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

      <Container>
        <ContentStyle>
          <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                ¡Empieza ahora con Alima Seller!
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {" "}
                Inicia tu cuenta gratis.
              </Typography>
            </Box>
            {/* <Tooltip title={method}>
              <Box component="img" src={`/static/auth/ic_${method}.png`} sx={{ width: 32, height: 32 }} />
            </Tooltip> */}
          </Box>

          {/* {method === 'firebase' && <AuthFirebaseSocials />} */}

          {/* Registration Form  */}
          <RegisterForm />

          <Typography
            variant="body2"
            align="center"
            sx={{ color: "text.secondary", mt: 3 }}
          >
            Al registrarte, tú y el negocio que representas están de acuerdo con
            la&nbsp;
            <Link
              underline="always"
              color="text.primary"
              onClick={() => {
                track("view_item", {
                  visit: window.location.toString(),
                  page: "Register",
                  section: "",
                });
                window.open(PATHS_EXTERNAL.privacyPolicy, "_blank");
              }}
              sx={{ cursor: "pointer" }}
            >
              Aviso de Privacidad
            </Link>
            &nbsp;y los&nbsp;
            <Link
              underline="always"
              color="text.primary"
              onClick={() => {
                track("select_content", {
                  visit: window.location.toString(),
                  page: "Register",
                  section: "",
                });
                window.open(PATHS_EXTERNAL.termsAndConditions, "_blank");
              }}
              sx={{ cursor: "pointer" }}
            >
              Términos y Condiciones
            </Link>
            &nbsp;de Alima.
          </Typography>

          <MHidden width="smUp">
            <Typography variant="body1" sx={{ mt: 2 }}>
              ¿Ya tienes una cuenta?&nbsp;
              <Link
                to={PATH_AUTH.login}
                component={RouterLink}
                variant="subtitle1"
                onClick={handleLoginRedirect}
              >
                Inicia Sesión
              </Link>
            </Typography>
          </MHidden>

          {/* Powered by Alima */}
          <MHidden width="mdUp">
            {/* Powered by Alima */}
            <MHidden width="mdUp">
              <Box
                position={"fixed"}
                sx={{
                  bottom: 4,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  align="center"
                  color={"text.secondary"}
                  sx={{ ml: -4 }}
                >
                  {`${pwaRelease} `} &nbsp;
                  <IconButton
                    sx={{ p: 0, fontSize: "inherit" }}
                    onClick={handleHotReload}
                  >
                    <Cached color="disabled" />
                  </IconButton>
                </Typography>
              </Box>
            </MHidden>
          </MHidden>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
