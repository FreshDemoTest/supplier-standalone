// material
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// hooks
// import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
// routes
import { PATH_APP } from '../../../routes/paths';
// layouts
// components
import Page from '../../../components/Page';
import SUnitForm from '../../../components/account/SUnitForm';

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

export default function AddSUnit() {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate(PATH_APP.root);
  };

  return (
    <RootStyle title="Agrega CEDIS | Alima">
      <Container>
        <ContentStyle>
          <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                Agregar Centro de Distribución
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {' '}
                Agrega la información de tu centro de distribución.
              </Typography>
            </Box>
          </Box>

          {/* Add Supplier Unit Form  */}
          <SUnitForm onSuccessCallback={handleSuccess} />
          
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
