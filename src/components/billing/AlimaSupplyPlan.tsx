import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { billingPlans } from "../../config";
import { fNoCentsCurrency } from "../../utils/helpers";

const ALIMA_PLAN_FEATURES = {
  ecommerceB2B: "E-commerce B2B",
  // unlimitedClients: "Clientes ilimitados",
  priceLists: "Listas de precios",
  reports: "Analítica en tiempo real",
  automatedInvoice: "Facturación Automática",
  conciliatedPayments: "Concilación de pagos",
};

const ALIMA_SUPPLY_PLANS = {
  alima_comercial: {
    name: "Alima Comercial",
    features: [
      ALIMA_PLAN_FEATURES.ecommerceB2B,
      // ALIMA_PLAN_FEATURES.unlimitedClients,
      ALIMA_PLAN_FEATURES.priceLists,
    ],
  },
  alima_pro: {
    name: "Alima Pro",
    features: [
      ALIMA_PLAN_FEATURES.ecommerceB2B,
      // ALIMA_PLAN_FEATURES.unlimitedClients,
      ALIMA_PLAN_FEATURES.priceLists,
      ALIMA_PLAN_FEATURES.reports,
      ALIMA_PLAN_FEATURES.automatedInvoice,
      ALIMA_PLAN_FEATURES.conciliatedPayments,
    ],
  },
};

type AlimaPlanType = keyof typeof ALIMA_SUPPLY_PLANS;

const ALIMA_SUPPLY_PLAN_PRICES: Record<AlimaPlanType, number> = Object.entries(
  billingPlans
)
  .filter(([key]) => key in ALIMA_SUPPLY_PLANS)
  .reduce((acc, [key, value]) => {
    acc[key as AlimaPlanType] = value.price;
    return acc;
  }, {} as Record<AlimaPlanType, number>);

// --------------------------------------------

type AlimaSupplyPlanProps = {
  plan: AlimaPlanType;
  defaultPrice?: number;
  selected?: boolean;
  onClick?: () => void;
};

const AlimaSupplyPlan: React.FC<AlimaSupplyPlanProps> = ({
  plan,
  defaultPrice,
  selected = false,
  onClick,
}) => {
  const theme = useTheme();
  const planDetails = ALIMA_SUPPLY_PLANS[plan];
  const displayPrice = defaultPrice || ALIMA_SUPPLY_PLAN_PRICES[plan];
  return (
    <Box
      sx={{
        m: 1,
        border: selected
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 1,
        minHeight: 200,
        maxHeight: 240,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <Grid container>
        <Grid item xs={4}>
          <Grid container direction="column-reverse" sx={{ height: 200 }}>
            <Grid item sx={{ my: 2, ml: 2 }}>
              <Typography variant="h6" color="text.secondary">
                {planDetails.name}
              </Typography>
              <Box display={"flex"}>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  sx={{
                    fontSize: {
                      xs: theme.typography.h6.fontSize,
                      md: theme.typography.h4.fontSize,
                    },
                  }}
                >
                  {fNoCentsCurrency(displayPrice)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  mt={{ xs: 0.8, md: 1 }}
                  color="text.secondary"
                  sx={{
                    fontSize: {
                      xs: theme.typography.body2.fontSize,
                      md: theme.typography.subtitle2.fontSize,
                    },
                  }}
                >
                  {" "}
                  &nbsp;+ IVA
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <List sx={{ mt: 1 }}>
            {planDetails.features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0, px: 1 }}>
                <ListItemIcon>
                  <CheckIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontSize: {
                      xs: theme.typography.caption.fontSize,
                      md: theme.typography.body1.fontSize,
                    },
                    color: theme.palette.text.secondary,
                    ml: -2.5, // Adjust the value here to make the space shorter
                  }}
                >
                  {feature}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlimaSupplyPlan;
export { ALIMA_SUPPLY_PLANS, ALIMA_SUPPLY_PLAN_PRICES, ALIMA_PLAN_FEATURES };
export type { AlimaPlanType };
