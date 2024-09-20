import { useEffect, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography } from "@mui/material";
// hooks
import useAuth from "../../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useParams } from "react-router";
// redux
import {
  getProductCatalog,
  getProductDetails,
  resetProductSATCodes,
  resetSupplierProdDetails,
} from "../../../redux/slices/supplier";
// components
import Page from "../../../components/Page";
import LoadingProgress from "../../../components/LoadingProgress";
import { getEcommerceInfo } from "../../../redux/slices/account";
import EcommerceParamsForm from "../../../components/supplier/EcommerceForm";
import { enqueueSnackbar } from "notistack";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 1200,
  margin: "auto",
  display: "flex",
  minHeight: "100%",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(0, 0),
}));

// ----------------------------------------------------------------------

export default function EditEcommerce() {
  const { productId } = useParams<{ productId: string }>();
  const { sessionToken, getSessionToken } = useAuth();
  const [ecommerceFetch, setEcommerceFetch] = useState(false);
  // const { isLoading } = useAppSelector(
  //   (state) => state.supplier
  // );
  const { ecommerceDetails, isLoading } = useAppSelector(
    (state) => state.account
  );
  const { supplierProdsCatalog, isLoading: isLoadingCatalog } = useAppSelector(
    (state) => state.supplier
  );
  const dispatch = useAppDispatch();

  // on dismount reset satCodes
  useEffect(() => {
    return () => {
      dispatch(resetProductSATCodes());
      dispatch(resetSupplierProdDetails());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  useEffect(() => {
    if (!sessionToken) return;
    dispatch(getEcommerceInfo(sessionToken));
    setEcommerceFetch(true);
  }, [dispatch, sessionToken]);

  const handleSuccess = (flag: boolean) => {
    if (flag) {
      // refetch product details
      dispatch(getProductDetails(productId || "", sessionToken || ""));
    }
  };

  // hook to fetch products
  useEffect(() => {
    if (!sessionToken) return;

    try {
      dispatch(getProductCatalog(sessionToken || ""));
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error al cargar productos", {
        variant: "error",
      });
    }
  }, [dispatch, sessionToken]);

  return (
    <>
      {(isLoading || isLoadingCatalog) && <LoadingProgress sx={{ mt: 4 }} />}
      {!isLoading && !isLoadingCatalog && ecommerceDetails?.supplierBusinessId && ecommerceFetch && (
        <RootStyle title="Edita E-commerce | Alima">
          <Container>
            <ContentStyle>
              <div style={{ marginTop: '20px' }}>
                <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      Personalizar Ecommerce
                    </Typography>
                  </Box>
                </Box>
              </div>

              {/* Edit Supplier Product Form  */}
              <EcommerceParamsForm
                onSuccessCallback={handleSuccess}
                ecommerceState={ecommerceDetails}
                supplierProdsCatalog={supplierProdsCatalog}
              />
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
      {!isLoading && !isLoadingCatalog && !ecommerceDetails?.supplierBusinessId && ecommerceFetch && (
        <RootStyle title="Edita E-commerce | Alima">
          <Container>
            <ContentStyle>
              <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    No hay ecommerce dado de alta
                  </Typography>
                </Box>
              </Box>
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
    </>
  );
}
