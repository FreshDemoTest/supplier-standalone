import { Icon, IconifyIcon } from '@iconify/react';
import { SnackbarProvider } from 'notistack';
import infoFill from '@iconify/icons-eva/info-fill';
import alertCircleFill from '@iconify/icons-eva/alert-circle-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';
import checkmarkCircle2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';
// material
import { useTheme } from '@mui/material/styles';
import { Box, GlobalStyles } from '@mui/material';
import { getColor } from '../utils/palette';

// ----------------------------------------------------------------------

function SnackbarStyles() {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        '&.notistack-MuiContent-success': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
          borderRadius: '10px',
        },
        '&.notistack-MuiContent-error': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
          borderRadius: '10px',
        },
        '&.notistack-MuiContent-warning': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
          borderRadius: '10px',
        },
        '&.notistack-MuiContent-info': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
          borderRadius: '10px',
        }
      }}
    />
  );
}

type SnackbarIconProps = {
  icon: IconifyIcon;
  color: string;
};

const SnackbarIcon: React.FC<SnackbarIconProps> = ({ icon, color }) => {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 36,
        height: 36,
        display: 'flex',
        borderRadius: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
        color: (theme) => `${getColor(theme, color).main}`,
        bgcolor: (theme) => theme.palette.background.paper
        // bgcolor: (theme) => alpha(`${getColor(theme, color).main}`, 0.16)
      }}
    >
      <Icon icon={icon} width={32} height={32} />
    </Box>
  );
};

type NotistackProviderProps = {
  children: any;
};

const NotistackProvider: React.FC<NotistackProviderProps> = ({ children }) => {
  return (
    <>
      <SnackbarStyles />
      <SnackbarProvider
        dense
        maxSnack={3}
        preventDuplicate
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        iconVariant={{
          success: <SnackbarIcon icon={checkmarkCircle2Fill} color="primary" />,
          error: <SnackbarIcon icon={infoFill} color="error" />,
          warning: <SnackbarIcon icon={alertTriangleFill} color="info" />,
          info: <SnackbarIcon icon={alertCircleFill} color="secondary" />
        }}
      >
        {children}
      </SnackbarProvider>
    </>
  );
};

export default NotistackProvider;
