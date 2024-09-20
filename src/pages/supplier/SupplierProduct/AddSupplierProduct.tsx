// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography } from "@mui/material";
// hooks
// import useAuth from '../../hooks/useAuth';
import { useNavigate } from "react-router";
// routes
import { PATH_APP } from "../../../routes/paths";
// layouts
// components
import Page from "../../../components/Page";
import SupplierProductForm from "../../../components/supplier/SupplierProductForm";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 960, // 480
  margin: "auto",
  display: "flex",
  minHeight: "100%",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(0, 0),
}));

// ----------------------------------------------------------------------

export default function AddSupplierProduct() {
  const navigate = useNavigate();

  const handleSuccess = (flag: boolean) => {
    if (flag) {
      navigate(PATH_APP.catalog.listProducts);
    }
  };

  return (
    <RootStyle title="Agrega Nuevo Producto | Alima">
      <Container>
        <ContentStyle>
          <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Nuevo producto
              </Typography>
            </Box>
          </Box>

          {/* Add Supplier Product Form  */}
          <SupplierProductForm onSuccessCallback={handleSuccess} />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
