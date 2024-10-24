import { Link as RouterLink } from "react-router-dom";
// material
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  LinearProgress,
  LinearProgressProps,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  useTheme,
  Link,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCirlceIcon from "@mui/icons-material/CheckCircle";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import AutoModeIcon from "@mui/icons-material/AutoMode";
// routes
import { PATH_APP } from "../../routes/paths";
// utils
import track from "../../utils/analytics";

// --------------------
const totalRegistrationSteps = 5;
// --------------------

function LinearProgressWithLabel(
  props: LinearProgressProps & { step: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >{`(${props.step}/${totalRegistrationSteps})`}</Typography>
      </Box>
    </Box>
  );
}

export type ProgressBarSectionProps = {
  createBusinessAccount: boolean;
  createUnit: boolean;
  createCatalog: boolean;
  createLegal: boolean;
  createBilling: boolean;
};

const ProgressBarSection: React.FC<ProgressBarSectionProps> = ({
  createBusinessAccount,
  createUnit,
  createCatalog,
  createLegal,
  createBilling,
}) => {
  const theme = useTheme();
  const currentStep = [
    createBusinessAccount,
    createUnit,
    createCatalog,
    createLegal,
    createBilling,
  ]
    .map((y): number => (y ? 1 : 0))
    .reduce((a, b) => a + b);

  // const notValidatedYet = alimaAccount && !alimaAccount.account;
  const isRegistrationProgressActive =
    createBusinessAccount && createUnit && createCatalog && createLegal;

  return (
    <Grid container alignItems={"center"} justifyContent={"center"}>
      <Grid item xs={12} lg={8}>
        <Accordion
          defaultExpanded
          sx={{ my: theme.spacing(2), py: theme.spacing(2) }}
          onChange={(event: any, expanded: boolean) => {
            track("select_content", {
              expanded: expanded,
              visit: window.location.toString(),
              page: "Home",
              section: "ProgressBarSection",
            });
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container direction="row" spacing={1}>
              <Grid item xs={12} lg={12}>
                <Typography>Progreso de Registro</Typography>
              </Grid>
              <Grid item xs={8} lg={6}>
                <LinearProgressWithLabel
                  step={currentStep}
                  value={(100 * currentStep) / totalRegistrationSteps}
                />
              </Grid>
            </Grid>
          </AccordionSummary>

          <AccordionDetails>
            {/* Pending validation message */}
            {isRegistrationProgressActive && (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AutoModeIcon color="info" />
                  </ListItemIcon>
                  ¡Listo! Estamos validando tus datos, te avisaremos cuando tu
                  cuenta esté activa.
                </ListItem>
              </List>
            )}
            {!isRegistrationProgressActive && (
              <List>
                <ListItem>
                  <ListItemIcon>
                    {createBusinessAccount && (
                      <CheckCirlceIcon color="primary" />
                    )}
                    {!createBusinessAccount && <PendingRoundedIcon />}
                  </ListItemIcon>
                  Crear Cuenta de Negocio
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {createUnit && <CheckCirlceIcon color="primary" />}
                    {!createUnit && <PendingRoundedIcon />}
                  </ListItemIcon>
                  Agregar un&nbsp;{""}
                  <Link
                    component={RouterLink}
                    to={PATH_APP.account.unit.add}
                    onClick={() => {
                      track("add_shipping_info", {
                        visit: window.location.toString(),
                        page: "Home",
                        section: "ProgressBarSection",
                      });
                    }}
                  >
                    <b>CEDIS</b>
                  </Link>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {createLegal && <CheckCirlceIcon color="primary" />}
                    {!createLegal && <PendingRoundedIcon />}
                  </ListItemIcon>
                  Carga tu información de tu&nbsp;{""}
                  <Link
                    component={RouterLink}
                    to={PATH_APP.account.legal}
                    onClick={() => {
                      track("add_payment_info", {
                        visit: window.location.toString(),
                        page: "Home",
                        section: "ProgressBarSection",
                      });
                    }}
                  >
                    <b>Empresa</b>
                  </Link>
                  .
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {createBilling && <CheckCirlceIcon color="primary" />}
                    {!createBilling && <PendingRoundedIcon />}
                  </ListItemIcon>
                  Da de alta tu&nbsp;{""}
                  <Link
                    component={RouterLink}
                    to={PATH_APP.alimaAccount}
                    onClick={() => {
                      track("add_payment_info", {
                        visit: window.location.toString(),
                        page: "Home",
                        section: "ProgressBarSection",
                      });
                    }}
                  >
                    <b>Método de Pago</b>
                  </Link>
                  .
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {createCatalog && <CheckCirlceIcon color="primary" />}
                    {!createCatalog && <PendingRoundedIcon />}
                  </ListItemIcon>
                  <Typography>
                    Agrega un&nbsp;
                    <Link
                      component={RouterLink}
                      to={PATH_APP.catalog.product.add}
                      onClick={() => {
                        track("add_to_cart", {
                          visit: window.location.toString(),
                          page: "Home",
                          section: "ProgressBarSection",
                        });
                      }}
                    >
                      <b>Producto</b>
                    </Link>
                    &nbsp;o haz{" "}
                    <Link
                      component={RouterLink}
                      to={PATH_APP.catalog.product.upload}
                      onClick={() => {
                        track("add_shipping_info", {
                          visit: window.location.toString(),
                          page: "Home",
                          section: "ProgressBarSection",
                        });
                      }}
                    >
                      <b>carga masiva</b>
                    </Link>
                  </Typography>
                </ListItem>
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default ProgressBarSection;
