import { useEffect, useRef } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography } from "@mui/material";
// hooks
import useAuth from "../../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useNavigate, useParams } from "react-router";
// routes
import { PATH_APP } from "../../../routes/paths";
// redux
import { getUnit, getUnitCategories } from "../../../redux/slices/account";
// components
import Page from "../../../components/Page";
import SUnitForm from "../../../components/account/SUnitForm";
import LoadingProgress from "../../../components/LoadingProgress";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100%",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(0, 0),
}));

// ----------------------------------------------------------------------

export default function EditSUnit() {
  const fetchedUnit = useRef(false);
  const { unitId } = useParams<{ unitId: string }>();
  const { sessionToken, getSessionToken } = useAuth();
  const navigate = useNavigate();
  const { editUnit, isLoading, unitCategories } = useAppSelector(
    (state) => state.account
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  // hoook - fetch units categories
  useEffect(() => {
    if (unitCategories.length === 0) {
      dispatch(getUnitCategories());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!unitId) return;
    if (!sessionToken) return;
    if (fetchedUnit.current) return;
    dispatch(getUnit(unitId, sessionToken));
    fetchedUnit.current = true;
  }, [dispatch, unitId, sessionToken]);

  const handleSuccess = () => {
    navigate(PATH_APP.root);
  };

  return (
    <>
      {isLoading && !editUnit?.id && unitCategories.length === 0 && (
        <LoadingProgress sx={{ my: 2 }} />
      )}
      {!isLoading && editUnit?.id && unitCategories.length !== 0 && (
        <RootStyle title="Edita CEDIS | Alima">
          <Container>
            <ContentStyle>
              <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    Editar CEDIS
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {" "}
                    Edita la información de tu centro de distribución.
                  </Typography>
                </Box>
              </Box>

              {/* Edit Unit Form  */}
              <SUnitForm
                onSuccessCallback={handleSuccess}
                editMode
                unitState={editUnit}
              />
            </ContentStyle>
          </Container>
        </RootStyle>
      )}
    </>
  );
}
