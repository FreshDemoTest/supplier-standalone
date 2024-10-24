import React from 'react';
// themes
import ThemeConfig from './themes';
import NotistackProvider from './components/NotistackProvider';
import GlobalStyles from './themes/globalStyles';
// routes
import Router, { appRoutes } from './routes';
// hooks
import useAuth from './hooks/useAuth';
// components
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import GoogleAnalytics from './components/GoogleAnalytics';

const App: React.FC = () => {
  const { isInitialized } = useAuth();

  return (
    // Theme Config Layer
    <ThemeConfig>
      {/* // [TODO-LATER] Language Localization Layer */}
      {/* Notification Provider */}
      <NotistackProvider>
        {/* Global app styles */}
        <GlobalStyles />
        <ScrollToTop /> {/* Scroll to top of page at load time */}
        <GoogleAnalytics />
        {/* Routed Application  */}
        {isInitialized ? <Router routes={appRoutes} /> : <LoadingScreen />}
      </NotistackProvider>
    </ThemeConfig>
  );
};

export default App;
