import { useState } from "react";
// material
import { styled } from "@mui/material/styles";
import { Box, Container, Typography } from "@mui/material";
// hooks
import { useNavigate } from "react-router";
import useAuth from "../../../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
// components
import Page from "../../../../components/Page";
import BasicDialog from "../../../../components/navigation/BasicDialog";
import PersonelForm from "../../../../components/account/PersonelForm";
// utils
import { delay } from "../../../../utils/helpers";
import track from "../../../../utils/analytics";
// paths
import { PATH_APP } from "../../../../routes/paths";
// redux
import { getTeamMembers } from "../../../../redux/slices/account";

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

const AddPersonel = () => {
  const { sessionToken } = useAuth();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [openErrorDiag, setOpenErrorDiag] = useState(false);
  const { business } = useAppSelector((state) => state.account);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSuccess = (validationReminder: boolean = true) => {
    if (validationReminder) {
      setOpenConfirmDiag(true);
    } else {
      setOpenErrorDiag(true);
    }
  };

  const handleOnContinue = async () => {
    await delay(500);
    setOpenConfirmDiag(false);
    track("select_content", {
      businessId: business.id,
      visit: window.location.toString(),
      page: "AddPersonel",
      section: "Modal",
    });
    // fetch all team members from backend
    dispatch(getTeamMembers(business.id, sessionToken || ""));
    navigate(PATH_APP.account.team.list);
  };

  return (
    <RootStyle title="Agrega Personal | Alima">
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="Personal Creado"
        msg="Tu nuevo miembro de tu Personal ha sido creado con éxito."
        continueAction={{
          active: true,
          msg: "Continuar",
          actionFn: handleOnContinue,
        }}
        closeMark={false}
        onClose={() => setOpenConfirmDiag(false)}
      />
      {/* error dialog */}
      <BasicDialog
        open={openErrorDiag}
        title="Error Creando Personal"
        msg="No se ha podido crear el nuevo miembro de tu Personal."
        backAction={{
          active: true,
          msg: "Ok",
          actionFn: () => setOpenErrorDiag(false),
        }}
        closeMark={false}
        onClose={() => setOpenErrorDiag(false)}
      />

      <Container>
        <ContentStyle>
          <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Agregar Personal
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {" "}
                Agrega la información de contacto, área y puesto dentro de tu
                negocio.
              </Typography>
            </Box>
          </Box>

          {/* Add Personel Form  */}
          <PersonelForm onSuccessCallback={handleSuccess} />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
};

export default AddPersonel;
