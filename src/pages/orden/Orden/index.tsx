import { SyntheticEvent, useEffect, useState } from "react";
// material
import { Box, Grid, styled, useTheme } from "@mui/material";
// hooks
import { useLocation, useNavigate, useParams } from "react-router";
// styles
import { S3Tab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// components
import Page from "../../../components/Page";
import OrdenDetails from "./OrdenDetails";
import InvoiceDetailsView from "./InvoiceDetails";
import track from "../../../utils/analytics";
import PaymentDetailsView from "./PaymentDetails";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
type OrdenPageProps = {
  viewMode: "orden" | "invoice" | "payment";
  title: string;
  ordenId: string;
};

const OrdenPage: React.FC<OrdenPageProps> = ({ viewMode, title, ordenId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(viewMode);
  const [pageTitle, setPageTitle] = useState(title);

  // handlers
  const changeTab = (newValue: string) => {
    setActiveTab(newValue as "orden" | "invoice" | "payment");
    setPageTitle(
      newValue === "orden"
        ? "Orden de Venta | Alima"
        : newValue === "invoice"
        ? "Factura | Alima"
        : "Pago | Alima"
    );
    track("select_content", {
      visit: window.location.toString(),
      page: "OrdenDetails",
      section: "OrdenDetailsNavTabs",
      tab: newValue,
    });
  };

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    navigate(`#${newValue}`);
  };

  useEffect(() => {
    changeTab(viewMode);
  }, [viewMode]);

  //

  return (
    <RootStyle title={pageTitle}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ mb: theme.spacing(1), px: theme.spacing(3) }}
      >
        <Grid item xs={12} lg={8}>
          <Box>
            <StyledTabs
              value={activeTab}
              onChange={handleChange}
              aria-label="info ordenes tabs"
              centered
            >
              <S3Tab value="orden" label="Orden de Venta" />
              <S3Tab value="invoice" label="Factura" />
              <S3Tab value="payment" label="Pago" />
            </StyledTabs>
          </Box>
          {activeTab === "orden" && <OrdenDetails ordenId={ordenId} />}
          {activeTab === "invoice" && <InvoiceDetailsView ordenId={ordenId} />}
          {activeTab === "payment" && <PaymentDetailsView ordenId={ordenId} />}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type OrdenProps = {
  viewMode: "orden" | "invoice" | "payment";
};

const Orden: React.FC<OrdenProps> = ({ viewMode }) => {
  const [vmode, setVmode] = useState(viewMode);
  const { ordenId } = useParams<{ ordenId: string }>();
  const { hash } = useLocation();

  // handling hash at URL to set viewMode
  useEffect(() => {
    if (hash) {
      if (hash === "#orden") {
        setVmode("orden");
      } else if (hash === "#invoice") {
        setVmode("invoice");
      } else {
        setVmode("payment");
      }
    }
  }, [hash]);

  return (
    <OrdenPage
      title={"Pedido | Alima"}
      viewMode={vmode}
      ordenId={ordenId || ""}
    />
  );
};

export default Orden;
