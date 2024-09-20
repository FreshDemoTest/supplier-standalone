// material
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import LoadingProgress from '../components/LoadingProgress';
// hooks
import { useAppSelector } from '../redux/store';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

// ----------------------------------------------------------------------

export default function NotAllowed() {
  const { loaded } = useAppSelector((state) => state.permission);
  const navigate = useNavigate();

  if (!loaded) {
    navigate(-1);
    return <LoadingProgress />;
  }

  return (
    <RootStyle title="Sin Accesos | Alima">
      <Container>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 3 }}>
            Acceso Denegado
          </Typography>
          <Typography variant="body1">
            Tu cuenta no tiene permisos para acceder a esta sección. Para poder
            acceder, contacta al administrador de tu cuenta.
          </Typography>
        </Box>
      </Container>
    </RootStyle>
  );
}
