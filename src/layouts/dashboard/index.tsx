import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
// components
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import BottomAppBar from './BottomAppBar';
import { PATH_APP } from '../../routes/paths';
import { useAppSelector } from '../../redux/store';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 48; // 64
const APP_BAR_DESKTOP = 48; // 92

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const theme = useTheme();
  const { collapseClick } = useCollapseDrawer();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { units } = useAppSelector((state) => state.account);

  // {/* Bottom app bar - no show in Add Unit or if no units available yet*/}
  const showBAppBar =
    ![PATH_APP.account.unit.add, PATH_APP.alimaAccount].includes(pathname) &&
    units &&
    units.length !== 0;

  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
      <DashboardSidebar
        isOpenSidebar={open}
        onCloseSidebar={() => setOpen(false)}
      />
      <MainStyle
        sx={{
          transition: theme.transitions.create('margin', {
            duration: theme.transitions.duration.complex
          }),
          ...(collapseClick && {
            ml: '84px'
          })
        }}
      >
        <Outlet />
      </MainStyle>

      {showBAppBar && <BottomAppBar />}
    </RootStyle>
  );
}
