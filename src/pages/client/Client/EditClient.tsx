import { useEffect, useRef, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// hooks
import useAuth from '../../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
// routes
import { PATH_APP } from '../../../routes/paths';
// redux

// components
import Page from '../../../components/Page';
import BasicDialog from '../../../components/navigation/BasicDialog';
import LoadingScreen from '../../../components/LoadingScreen';
// utils
import { delay } from '../../../utils/helpers';
import { getClientProfile, resetClientProfileSuccess } from '../../../redux/slices/client';
import ClientForm from '../../../components/client/ClientForm';
import { enqueueSnackbar } from 'notistack';
import { ClientBranchType, ClientInvoiceInfoType, ClientPOCType } from '../../../domain/client/Client';
import { getUnit } from '../../../redux/slices/account';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(0, 0)
}));

// ----------------------------------------------------------------------

const EditClient = () => {
  const fetchedCl = useRef(null);
  const { clientId } = useParams<{ clientId: string }>();
  const { sessionToken } = useAuth();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [clientSearch, setClientSearch] = useState(false);
  const navigate = useNavigate();
  const [editClientProfile, setEditClientProfile] = useState<ClientBranchType & ClientPOCType & ClientInvoiceInfoType>();
  const { clientProfile, clientProfileNotFound, isLoading } = useAppSelector(
    (state) => state.client
  );
  const { activeUnit, editUnit } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();

  // hook - fetch client profile
  useEffect(() => {
    if (editUnit?.id) {
      if (editUnit?.invoicePaymentMethod && editUnit?.invoicingTrigger){
        const vars = {
          ...clientProfile,
          invoicePaymentMethod: editUnit.invoicePaymentMethod,
          invoicingTrigger: editUnit.invoicingTrigger
        }
        setEditClientProfile(vars as ClientBranchType & ClientPOCType & ClientInvoiceInfoType);
      }
      else {
        setEditClientProfile(clientProfile)
      }
    }
    
    
  }, [editUnit, clientProfile]);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear or reset the variables when leaving the page
      dispatch(resetClientProfileSuccess())
      // Additional cleanup if needed
    };
  }, [dispatch]);

  // hook - fetch client profile
  useEffect(() => {
    if (!clientId) return;
    if (!sessionToken) return;
    if (!activeUnit) return;
    if (fetchedCl.current === activeUnit.id) return;
    dispatch(getClientProfile(activeUnit.id, clientId, sessionToken));
    setClientSearch(true)
    fetchedCl.current = activeUnit.id;
  }, [dispatch, clientId, sessionToken, activeUnit]);

  // hook - fetch client profile
  useEffect(() => {
    if (!activeUnit?.id) return;
    if (!sessionToken) return;
    if (!clientProfile?.id) return;
    if (clientProfile?.invoicePaymentMethod && clientProfile?.invoicingTrigger){
      setEditClientProfile(clientProfile);
    }
    else if (activeUnit.id){
      dispatch(getUnit(activeUnit.id, sessionToken))
    }  
  }, [dispatch, clientProfile, activeUnit, sessionToken]);

  

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
  };

  if (clientProfile && clientProfile?.business?.active === true) {
    enqueueSnackbar(
      'El Cliente ya tiene una cuenta activa, no se puede actualizar.',
      {
        variant: 'warning'
      }
    );
    navigate(PATH_APP.client.list);
  }

  return (
    <>
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="Cliente actualizado"
        msg="El cliente ha sido correctamente actualizado."
        continueAction={{
          active: true,
          msg: 'Continuar',
          actionFn: handleOnContinue
        }}
        closeMark={false}
        onClose={() => setOpenConfirmDiag(false)}
      />
      {isLoading && !clientProfile?.id && <LoadingScreen />}
      {!isLoading && clientSearch && (
        <RootStyle title="Editar Cliente | Alima">
          {editClientProfile?.id && !clientProfileNotFound && (
            <Container>
              <ContentStyle>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      Editar Cliente
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {' '}
                      Edita la información del cliente.
                    </Typography>
                  </Box>
                </Box>

                {/* Edit Client Form  */}
                <ClientForm
                  onSuccessCallback={handleSuccess}
                  clientState={editClientProfile}
                  editMode
                />
              </ContentStyle>
            </Container>
          )}
          {clientProfileNotFound && (
            <Container>
              <ContentStyle>
                <Typography variant="h4" gutterBottom>
                  Cliente no encontrado
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {' '}
                  El cliente no existe o está asignado a otro CEDIS. Intenta
                  cambiando de CEDIS.
                </Typography>
              </ContentStyle>
            </Container>
          )}
        </RootStyle>
      )}
    </>
  );
};

export default EditClient;
