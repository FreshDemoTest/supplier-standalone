import React from 'react';
import logo from '../logo.svg';
import InstallPWAButton from '../components/InstallPWAButton';
import { keyframes, styled } from '@mui/material';

const AppStyle = styled('div')(({ theme }) => ({
  textAlign: 'center'
}));

const AppHeaderStyle = styled('header')(({ theme }) => ({
  backgroundColor: '#282c34',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: `calc(10px + 2vmin)`,
  color: 'white'
}));

const AStyle = styled('a')(({ theme }) => ({
  color: '#61DAFB'
}));

const AppLogoKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const AppLogoStyle = styled('img')(({theme}) => ({
  height: '40vmin',
  pointerEvents: 'none',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${AppLogoKeyframes} infinite 20s linear`,
  }
}));

const InitScreen: React.FC = () => {
  return (
    <AppStyle>
      <AppHeaderStyle>
        <AppLogoStyle src={logo} alt="logo" />
        <p>
          This is the <code>Home</code> page of the Supplier application.
        </p>
        <AStyle
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Alima
        </AStyle>
        <div>
          <InstallPWAButton />
        </div>
      </AppHeaderStyle>
    </AppStyle>
  );
};

export default InitScreen;
