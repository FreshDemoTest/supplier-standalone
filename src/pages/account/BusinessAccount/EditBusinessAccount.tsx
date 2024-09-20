import { useEffect, useRef, useState } from 'react';
// material
import { Box } from '@mui/material';
// hooks
import useAuth from '../../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
// redux
import { getBusinessAccount } from '../../../redux/slices/account';
// layouts
// components
import BasicDialog from '../../../components/navigation/BasicDialog';
import BusinessAccountForm from '../../../components/BusinessAccountForm';
import LoadingScreen from '../../../components/LoadingScreen';
// utils
import { delay } from '../../../utils/helpers';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function EditBusinessAccount() {
  const isFetchedRef = useRef(false);
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [openErrorDiag, setOpenErrorDiag] = useState(false);
  const { sessionToken, getSessionToken } = useAuth();
  const { business } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();

  // hook - update session token
  useEffect(() => {
    if (!sessionToken) {
      getSessionToken();
    }
  }, [sessionToken, getSessionToken]);

  useEffect(() => {
    // routine to fetch all business & account info from backend
    if (isFetchedRef.current) return;
    if (sessionToken) {
      isFetchedRef.current = true;
      dispatch(getBusinessAccount(sessionToken));
    }
  }, [dispatch, sessionToken]);

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
    if (sessionToken) {
      dispatch(getBusinessAccount(sessionToken));
    }
    setOpenErrorDiag(false);
  };

  return (
    <>
      {!business.businessType && <LoadingScreen />}
      {business.businessType && (
        <Box sx={{ mt: 3 }}>
          {/* confirmation dialog */}
          <BasicDialog
            open={openConfirmDiag}
            title="Cuenta Actualizada"
            msg="Tu cuenta ha sido actualizada con éxito."
            continueAction={{
              active: true,
              msg: 'Continuar',
              actionFn: handleOnContinue
            }}
            closeMark={false}
            onClose={() => setOpenConfirmDiag(false)}
          />
          {/* error dialog */}
          <BasicDialog
            open={openErrorDiag}
            title="Error en Cuenta"
            msg="Tu cuenta no ha podido ser actualizada."
            backAction={{
              active: true,
              msg: 'Continuar',
              actionFn: handleOnContinue
            }}
            closeMark={false}
            onClose={() => setOpenErrorDiag(false)}
          />
          {/* Edit Business Account Form  */}
          <BusinessAccountForm
            onSuccessCallback={handleSuccess}
            businessState={business}
            editMode
          />
        </Box>
      )}
    </>
  );
}
