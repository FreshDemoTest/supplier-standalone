import { Icon } from "@iconify/react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
// import piechartFill from "@iconify/icons-ic/outline-pie-chart";
// import barchartFill from "@iconify/icons-ic/outline-bar-chart";
// import chartFill from "@iconify/icons-ic/multiline-chart";
import whatsappFill from "@iconify/icons-ic/outline-whatsapp";
// components & styles
import MetabaseIFrame from "../report/MetabaseIFrame";
import {
  DataCardStyleLg,
  DataCardStyleMd,
  DataCardStyleSm,
} from "../../styles/cards/dataCards";
// utils & routes
import { mixtrack } from "../../utils/analytics";
import { PATHS_EXTERNAL } from "../../routes/paths";

// ----------------------------------------------------------------------

type DataInsightsSectionProps = {
  businessId: string;
};

const DataInsightsSection: React.FC<DataInsightsSectionProps> = ({
  businessId,
}) => {
  const theme = useTheme();

  const metabaseDashs = {
    // main graph
    weeklySales: {
      dashboardId: 65,
      dashboardParams: {
        supplier_business: businessId,
      },
      title: "Ventas Semanales",
      height: 500,
    },
    // 2nd row - 1st card
    churnedClients: {
      dashboardId: 71,
      dashboardParams: {
        supplier_business: businessId,
        dias: "15",
      },
      title: "Clientes Sin Comprar en 15 Dias",
      height: 480,
    },
    // side notifications
    unconfirmedOrdenes: {
      dashboardId: 69,
      dashboardParams: {
        supplier_business: businessId,
      },
      title: "Pedidos sin Confirmar",
      height: 240,
    },
    numClients: {
      dashboardId: 72,
      dashboardParams: {
        supplier_business: businessId,
      },
      title: "Clientes Mensuales",
      height: 300,
      sx: {
        marginTop: -100,
      },
    },
    awvClients: {
      dashboardId: 73,
      dashboardParams: {
        supplier_business: businessId,
      },
      title: "Venta Promedio Semanal por Cliente",
      height: 300,
      sx: {
        marginTop: -100,
      },
    },
  };

  return (
    <Grid container direction={"row-reverse"} sx={{ mt: 3 }}>
      {/* rightest column / Top row for Data Insights */}
      <Grid item xs={12} md={3}>
        {/* Pedidos sin confirmar */}
        <DataCardStyleSm
          sx={{ height: { xs: 210, md: 210, pt: { xs: 0, md: 0 } } }}
        >
          <MetabaseIFrame {...metabaseDashs.unconfirmedOrdenes} />
        </DataCardStyleSm>
        {/* Clientes */}
        <DataCardStyleSm sx={{ height: 250, pt: { xs: 6, md: 2 } }}>
          <MetabaseIFrame {...metabaseDashs.numClients} />
        </DataCardStyleSm>
        {/* AWV Client */}
        <DataCardStyleSm sx={{ height: 250, pt: { xs: 4, md: 2 } }}>
          <MetabaseIFrame {...metabaseDashs.awvClients} />
        </DataCardStyleSm>
      </Grid>
      {/* left column / 2nd row */}
      <Grid item xs={12} md={9}>
        <Grid container>
          {/* top row */}
          <Grid item xs={12} md={12}>
            {/* Ventas Semanales */}
            <DataCardStyleLg
              sx={{ height: { xs: 350, md: 500 }, pt: { xs: -10, md: 0 } }}
            >
              <MetabaseIFrame {...metabaseDashs.weeklySales} />
            </DataCardStyleLg>
          </Grid>
          {/* 2nd row */}
          <Grid item xs={12} md={8}>
            {/* Churned Clients */}
            <DataCardStyleMd
              sx={{ height: { xs: 360, md: 390 }, pt: { xs: 0, md: 0 } }}
            >
              <MetabaseIFrame {...metabaseDashs.churnedClients} />
            </DataCardStyleMd>
          </Grid>
          {/* Right column */}
          <Grid item xs={12} md={4}>
            <DataCardStyleSm sx={{ height: 280 }}>
              {/* Whatsapp Automation promo */}
              <Box sx={{ justifyContent: "center" }}>
                <Box sx={{ mb: 1, justifyContent: "center", display: "flex" }}>
                  <Icon
                    icon={whatsappFill}
                    width={64}
                    height={64}
                    style={{ color: theme.palette.divider }}
                  />
                </Box>
                <Box sx={{ px: 2, justifyContent: "center" }}>
                  <Typography
                    variant="subtitle2"
                    align="center"
                    color="text.secondary"
                  >
                    ¿Te gustaría automatizar tus pedidos en WhatsApp?
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                    align="center"
                  >
                    Haz click aquí para saber más
                  </Typography>
                </Box>
                <Box sx={{ justifyContent: "center", display: "flex" }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      mixtrack("whatsapp_automation_cta", {
                        visit: window.location.toString(),
                        page: "Home",
                        section: "DataInsights",
                      });
                      window.open(
                        PATHS_EXTERNAL.whatsAppAutomationCTA,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    Más Información
                  </Button>
                </Box>
              </Box>
            </DataCardStyleSm>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DataInsightsSection;
