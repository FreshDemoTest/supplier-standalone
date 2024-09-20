import { Box, Typography, styled } from '@mui/material';

const APPBAR_MOBILE = 42;

const FooterBox = styled(Box)(({ theme }) => ({
  width: '100%',
  top: 'auto',
  bottom: 0,
  height: APPBAR_MOBILE,
  paddingRight: theme.spacing(4),
  marginTop: theme.spacing(0),
  marginBottom: theme.spacing(0),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
}));

const PoweredTypo = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary
}));


export { APPBAR_MOBILE, FooterBox, PoweredTypo };