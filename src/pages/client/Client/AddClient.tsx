import { useEffect, useState } from "react";
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
import BasicDialog from "../../../components/navigation/BasicDialog";
import ClientForm from "../../../components/client/ClientForm";
// utils
import { delay } from "../../../utils/helpers";
import track from "../../../utils/analytics";
import { getUnit } from "../../../redux/slices/account";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import {
  ClientBranchType,
  ClientInvoiceInfoType,
  ClientPOCType,
} from "../../../domain/client/Client";
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

const AddSupplier = () => {
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [addClientProfile, setAddClientProfile] = useState<
    ClientBranchType & ClientPOCType & ClientInvoiceInfoType
  >();
  const [addClientProfileSuccess, setAddClientProfileSuccess] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  // const { clientCategories } = useAppSelector((state) => state.client);
  const { activeUnit, editUnit } = useAppSelector((state) => state.account);

  // hook - fetch client profile
  useEffect(() => {
    if (editUnit?.id) {
      if (editUnit?.invoicePaymentMethod && editUnit?.invoicingTrigger) {
        const vars = {
          branchName: "",
          // clientCategory: '',
          street: "",
          externalNum: "",
          internalNum: "",
          neighborhood: "",
          city: "",
          estate: "",
          country: "México",
          zipCode: "",
          displayName: "",
          email: "",
          phoneNumber: "",
          taxId: "", // RFC in Mexico
          fiscalRegime: "",
          taxName: "",
          taxAddress: "",
          cfdiUse: "",
          taxZipCode: "",
          invoiceEmail: "",
          tags: [],
          invoicePaymentMethod: editUnit.invoicePaymentMethod,
          invoicingTrigger: editUnit.invoicingTrigger,
        };
        setAddClientProfile(
          vars as ClientBranchType & ClientPOCType & ClientInvoiceInfoType
        );
        setAddClientProfileSuccess(true);
      } else {
        setAddClientProfile({
          branchName: "",
          // clientCategory: '',
          street: "",
          externalNum: "",
          internalNum: "",
          neighborhood: "",
          city: "",
          estate: "",
          country: "México",
          zipCode: "",
          displayName: "",
          email: "",
          phoneNumber: "",
          taxId: "", // RFC in Mexico
          fiscalRegime: "",
          taxName: "",
          taxAddress: "",
          cfdiUse: "",
          taxZipCode: "",
          invoiceEmail: "",
          invoicePaymentMethod: undefined,
          invoicingTrigger: undefined,
          tags: [],
        } as ClientBranchType & ClientPOCType & ClientInvoiceInfoType);
        setAddClientProfileSuccess(true);
      }
    }
  }, [editUnit]);

  const handleSuccess = (validationReminder: boolean = true) => {
    if (validationReminder) {
      setOpenConfirmDiag(true);
    } else {
      handleOnContinue();
    }
  };

  const handleOnContinue = async () => {
    await delay(500);
    setOpenConfirmDiag(false);
    navigate(PATH_APP.client.list);
    track("select_content", {
      visit: window.location.toString(),
      page: "AddClient",
      section: "ClientConfirmationModal",
    });
  };

  useEffect(() => {
    if (!activeUnit) return;
    if (!sessionToken) return;
    if (!activeUnit?.id) return;
    // if (fetchedUnit.current) return;
    setAddClientProfileSuccess(false);
    dispatch(getUnit(activeUnit.id, sessionToken));
    // fetchedUnit.current = true;
  }, [dispatch, activeUnit, sessionToken]);

  const loadingClient = !editUnit?.id;

  if (loadingClient) {
    return <LoadingProgress sx={{ my: 4 }}></LoadingProgress>;
  }

  return (
    <RootStyle title="Agrega Cliente | Alima">
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="Cliente agregado"
        msg="El cliente ha sido correctamente guardado."
        continueAction={{
          active: true,
          msg: "Continuar",
          actionFn: handleOnContinue,
        }}
        closeMark={false}
        onClose={() => setOpenConfirmDiag(false)}
      />
      {addClientProfileSuccess && (
        <Container>
          <ContentStyle>
            <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Agregar Cliente
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {" "}
                  Agrega la información de tu cliente.
                </Typography>
              </Box>
            </Box>

            {/* Add Supplier Form  */}
            <ClientForm
              onSuccessCallback={handleSuccess}
              clientState={addClientProfile}
            />
          </ContentStyle>
        </Container>
      )}
    </RootStyle>
  );
};

export default AddSupplier;
