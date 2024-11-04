// material
import { Box } from "@mui/material";
import React from "react";

// ----------------------------------------------------------------------

type LogoProps = {
  width?: number;
  height?: number;
  paddingTop?: number;
  sx?: any;
  other?: any;
};

const Logo: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  paddingTop = 1.9,
  sx = {},
  ...other
}) => {
  const bWidth = width;
  const bHeight = height;
  const bPaddingTop = paddingTop;

  return (
    <Box
      sx={{ ...sx, width: bWidth, height: bHeight, paddingTop: bPaddingTop }}
      {...other}
    >
    </Box>
  );
};

const LogoAlter: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  paddingTop = 1.9,
  sx = {},
  ...other
}) => {
  const bWidth = width;
  const bHeight = height;
  const bPaddingTop = paddingTop;

  return (
    <Box
      sx={{ ...sx, width: bWidth, height: bHeight, paddingTop: bPaddingTop }}
      {...other}
    >
      
    </Box>
  );
};

export default Logo;
export { LogoAlter };
