// import clientDetailsView from "./clientDetails";
// material
import { styled } from "@mui/material/styles";
import { Button, Container, Grid, Typography, useTheme } from "@mui/material";
// hooks
import ClientProfileDetailsView from "./ClientProfileDetails";
// layouts
// components
import Page from "../../../components/Page";
import { useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  getClientProfile,
  resetClientProfileSuccess,
  resetEcommerceClientTemporalPassword,
} from "../../../redux/slices/client";
import { resetEditUnitSuccess } from "../../../redux/slices/account";
import { getUnit } from "../../../redux/slices/account";
import LoadingProgress from "../../../components/LoadingProgress";
import { PATH_APP } from "../../../routes/paths";

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
type ClientDetailsPageProps = {};

const ClientDetailsPage: React.FC<ClientDetailsPageProps> = () => {
  const { clientId } = useParams<{
    clientId: string;
  }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { activeUnit, editUnit } = useAppSelector((state) => state.account);
  const { clientProfile, clientProfileNotFound, isLoading } = useAppSelector(
    (state) => state.client
  );
  useEffect(() => {
    if (!activeUnit?.id) return;
    if (clientId && clientId !== "null" && sessionToken) {
      dispatch(getClientProfile(activeUnit.id, clientId, sessionToken));
      dispatch(getUnit(activeUnit.id, sessionToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeUnit, sessionToken]);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear or reset the variables when leaving the page
      dispatch(resetEcommerceClientTemporalPassword());
      dispatch(resetClientProfileSuccess());
      // Additional cleanup if needed
    };
  }, [dispatch]);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear or reset the variables when leaving the page
      dispatch(resetClientProfileSuccess());
      dispatch(resetEditUnitSuccess());
      // Additional cleanup if needed
    };
  }, [dispatch]);

  return (
    <RootStyle title="Detalles de cliente | Alima">
      <Grid
        container
        justifyContent="center"
        alignItems="flex-start"
        style={{ minHeight: "100vh" }}
      >
        <Grid item>
          {isLoading && <LoadingProgress sx={{ my: 4 }} />}
          {!isLoading && clientProfileNotFound && (
            <Container sx={{ mt: 2 }}>
              <ContentStyle>
                <Typography variant="h4" gutterBottom>
                  Cliente no encontrado
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {" "}
                  El cliente no existe o está asignado a otro CEDIS. Intenta
                  cambiando de CEDIS.
                </Typography>
              </ContentStyle>
            </Container>
          )}
          {!isLoading && clientProfile?.id && !clientProfileNotFound && (
            <Container>
              <ContentStyle>
                {/* Your client details content goes here */}
                <Grid container sx={{ mb: 5 }}>
                  <Grid item xs={7} md={9}>
                    <Typography variant="h4" gutterBottom>
                      Detalles de cliente
                    </Typography>
                  </Grid>
                  <Grid item xs={5} md={2}>
                    {!clientProfile.business?.active ? (
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        sx={{
                          color: theme.palette.grey[500],
                          borderColor: theme.palette.grey[500],
                        }}
                        onClick={() => {
                          navigate(
                            PATH_APP.client.edit.replace(
                              ":clientId",
                              clientProfile.id
                            )
                          );
                        }}
                      >
                        Editar Cliente
                      </Button>
                    ) : null}
                  </Grid>
                </Grid>
                <ClientProfileDetailsView
                  clientProfile={clientProfile}
                  unitProfile={editUnit}
                />
              </ContentStyle>
            </Container>
          )}
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

export default ClientDetailsPage;
