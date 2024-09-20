// material
import { styled } from '@mui/material/styles';
//
import ImagoType from './ImagoType';
import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default
}));

const LoadingTextStyle = styled(Typography)(({theme}) => ({
  color: theme.palette.text.secondary
}));

// ----------------------------------------------------------------------

export default function LoadingScreen({ ...other }) {
  return (
    <>
      <RootStyle {...other}>
        <Box sx={{textAlign: 'center'}}>
          <ImagoType />
          <LoadingTextStyle variant='h6'>
            Cargando ...
          </LoadingTextStyle>
        </Box>
      </RootStyle>
    </>
  );
}
