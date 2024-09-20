import { useEffect, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// hooks
import { useNavigate, useParams } from 'react-router';
import useAuth from '../../../../hooks/useAuth';
// components
import Page from '../../../../components/Page';
import BasicDialog from '../../../../components/navigation/BasicDialog';
import PersonelForm from '../../../../components/account/PersonelForm';
// routes
import { PATH_APP } from '../../../../routes/paths';
// redux
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { getTeamMembers, getTeammate } from '../../../../redux/slices/account';
// utils
import { mixtrack } from '../../../../utils/analytics';
import { delay } from '../../../../utils/helpers';

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

const EditPersonel = () => {
  const { userId } = useParams<{ userId: string }>();
  const { sessionToken } = useAuth();
  const [openConfirmDiag, setOpenConfirmDiag] = useState(false);
  const [openErrorDiag, setOpenErrorDiag] = useState(false);
  const navigate = useNavigate();
  const { teammateDetails, units, business } = useAppSelector(
    (state) => state.account
  );
  const dispatch = useAppDispatch();
  const [teamateState, setTeamateState] = useState<any>({});

  // hook - get teamate
  useEffect(() => {
    if (userId) {
      const _getTeammate = async () => {
        await dispatch(getTeammate(userId));
      };
      _getTeammate();
    }
  }, [dispatch, userId]);

  // hook - set teamate state
  useEffect(() => {
    const _tm = { ...teammateDetails };
    let _admin = false;
    // data completion
    if (_tm?.units?.length > 0) {
      _tm.units = _tm.units.map((unt: any) => {
        const _unit = units.find((b: any) => b.id === unt.unit.id);
        // show admin if at least one unit has admin
        const _admin_perm = unt.permissions.find(
          (p: any) => p.key === 'usersadmin-all'
        );
        _admin = _admin_perm?.value || false;
        return {
          unit: _unit,
          permissions: unt.permissions.filter(
            (p: any) => p.key !== 'usersadmin-all'
          )
        };
      });
    }
    _tm.admin = _admin;
    // validate if admin
    setTeamateState(_tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teammateDetails]);

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
    mixtrack('edit_personel', {
      businessId: business.id,
      visit: window.location.toString(),
      page: 'EditPersonel',
      section: 'Modal'
    });
    // fetch all team members from backend
    dispatch(getTeamMembers(business.id, sessionToken || ''));
    navigate(PATH_APP.account.team.list);
  };

  return (
    <RootStyle title="Edita Personal | Alima">
      {/* confirmation dialog */}
      <BasicDialog
        open={openConfirmDiag}
        title="Personal Actualizado"
        msg="El miembro de tu Personal ha sido actualizado con éxito."
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
        title="Error Actualizando Personal"
        msg="No se ha podido actualizar el miembro de tu Personal."
        backAction={{
          active: true,
          msg: 'Ok',
          actionFn: () => setOpenErrorDiag(false)
        }}
        closeMark={false}
        onClose={() => setOpenErrorDiag(false)}
      />

      <Container>
        <ContentStyle>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Actualizar Personal
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {' '}
                Actualiza la información de contacto, área y puesto dentro de tu
                negocio.
              </Typography>
            </Box>
          </Box>

          {/* Edit Personel Form  */}
          {teamateState?.user?.email && (
            <PersonelForm
              onSuccessCallback={handleSuccess}
              userState={teamateState}
              editMode
            />
          )}
          {!teamateState?.user?.email && (
            <Typography variant="h4" gutterBottom>
              Personal no encontrado.
            </Typography>
          )}
        </ContentStyle>
      </Container>
    </RootStyle>
  );
};

export default EditPersonel;
