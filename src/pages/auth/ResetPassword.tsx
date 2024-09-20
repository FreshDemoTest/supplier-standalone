import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// layouts
import AuthLayout from '../../layouts/AuthLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import ResetPasswordForm from '../../components/auth/ResetPassordForm';

//

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <RootStyle title="Resetear Contraseña | Alima">
      <AuthLayout pageName="ResetPassword" />

      <Container>
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          {!sent ? (
            <>
              <Typography variant="h3" paragraph>
                ¿Olvidaste tu contraseña?
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                Porfavor ingresa el correo electrónico asociado a tu cuenta y te
                enviaremos un link para resetear tu contraseña.
              </Typography>

              <ResetPasswordForm
                onSent={() => setSent(true)}
                onGetEmail={(value) => setEmail(value)}
              />

              <Button
                fullWidth
                size="large"
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{ mt: 1 }}
              >
                Regresar
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom>
                ¡Envío exitoso!
              </Typography>
              <Typography>
                Enviamos un correo electrónico de confirmación a &nbsp;
                <strong>{email}</strong>
                <br />
                Por favor revisa tu email.
              </Typography>

              <Button
                size="large"
                variant="contained"
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{ mt: 5 }}
              >
                Regresar
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </RootStyle>
  );
}
