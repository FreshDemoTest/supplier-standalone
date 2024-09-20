import { useState } from 'react';
// material
import { Box } from '@mui/material';
// hooks
// import useAuth from '../../hooks/useAuth';
// routes
// layouts
// components
import BasicDialog from '../../../components/navigation/BasicDialog';
import LegalInfoForm from '../../../components/account/LegalInfoForm';
// utils
import { delay } from '../../../utils/helpers';
import { useAppSelector } from '../../../redux/store';
import LoadingProgress from '../../../components/LoadingProgress';


// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const LegalInfo = () => {
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [openErrorDiag, setOpenErrorDiag] = useState(false);
  const { legal, isLoading } = useAppSelector((state) => state.account);

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
    setOpenErrorDiag(false);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="Información Actualizada"
        msg="Tus datos legales han sido actualizados con éxito."
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
        title="Error Actualizando Datos"
        msg="Tus datos legales no han podido ser actualizados."
        backAction={{
          active: true,
          msg: 'Continuar',
          actionFn: handleOnContinue
        }}
        closeMark={false}
        onClose={() => setOpenConfirmDiag(false)}
      />
      {/* Loading screen */}
      {isLoading && <LoadingProgress sx={{ mt: 3 }} />}
      {/* Edit Legal Info Form  */}
      {!isLoading && (
      <LegalInfoForm onSuccessCallback={handleSuccess} legalInfoState={legal} />
      )}
    </Box>
  );
};

export default LegalInfo;

