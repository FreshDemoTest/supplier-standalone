import { useMemo } from 'react';
// material
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
//
import shape from './shape';
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
// import componentsOverride from './overrides';
// import shadows from './shadows';

// ----------------------------------------------------------------------

type ThemeConfigProps = {
  children?: any;
}

const ThemeConfig: React.FC<ThemeConfigProps> = ({ children }) => {
  const themeOptions = useMemo(
    () => ({
      palette: palette.light,
      shape,
      typography,
      breakpoints,
      // shadows: shadows.light,
    }),
    []
  );

  const theme = createTheme(themeOptions);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default ThemeConfig;