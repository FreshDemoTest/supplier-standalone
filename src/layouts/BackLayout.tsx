import { useNavigate } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { IconButton, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import BackFill from '@iconify/icons-ic/navigate-before';
// components
import MHidden from '../components/extensions/MHidden';
import { mixtrack } from '../utils/analytics';
//

// ----------------------------------------------------------------------

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(3, 5, 0, 7)
    // padding: theme.spacing(7, 5, 0, 7)
  }
}));

// ----------------------------------------------------------------------

type BackLayoutProps = {
  children?: any;
};

const BackLayout: React.FC<BackLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <HeaderStyle>
      <IconButton
        onClick={() => {
          mixtrack('back_click', {
            visit: window.location.toString(),
            page: '',
            section: 'TopBar'
          });
          navigate(-1);
        }}
        size={'medium'}
      >
        <Icon icon={BackFill} width={32} height={32} />
      </IconButton>

      <MHidden width="smDown">
        <Typography
          variant="body2"
          sx={{
            mt: { md: -2 }
          }}
        >
          {children}
        </Typography>
      </MHidden>
    </HeaderStyle>
  );
};

export default BackLayout;
