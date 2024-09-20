import { useEffect, useRef } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography } from "@mui/material";
// hooks
import useAuth from "../../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useParams } from "react-router";
// redux
import {
  getProductDetails,
  getUnitDefaultPriceLists,
  resetProductSATCodes,
  resetSupplierProdDetails,
} from "../../../redux/slices/supplier";
// components
import Page from "../../../components/Page";
import SupplierProductForm from "../../../components/supplier/SupplierProductForm";
import LoadingProgress from "../../../components/LoadingProgress";

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

export default function EditSupplierProduct() {
  const fetchedProduct = useRef(false);
  const { productId } = useParams<{ productId: string }>();
  const { sessionToken, getSessionToken } = useAuth();
  const { supplierProductDetails, isLoading } = useAppSelector(
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
    if (!productId) return;
    if (!sessionToken) return;
    if (fetchedProduct.current) return;
    dispatch(getProductDetails(productId, sessionToken));
    dispatch(getUnitDefaultPriceLists(productId || "", sessionToken || ""));
    fetchedProduct.current = true;
  }, [dispatch, productId, sessionToken]);

  const handleSuccess = (flag: boolean) => {
    if (flag) {
      // refetch product details
      dispatch(getProductDetails(productId || "", sessionToken || ""));
      dispatch(getUnitDefaultPriceLists(productId || "", sessionToken || ""));
    }
  };

  return (
    <>
      {isLoading && <LoadingProgress sx={{ mt: 2 }} />}
      {!isLoading && supplierProductDetails?.id && (
        <RootStyle title="Edita Producto | Alima">
          <Container>
            <ContentStyle>
              <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    Editar Producto
                  </Typography>
                </Box>
              </Box>

              {/* Edit Supplier Product Form  */}
              <SupplierProductForm
                onSuccessCallback={handleSuccess}
                editMode
                supProductState={supplierProductDetails}
              />
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
    </>
  );
}
