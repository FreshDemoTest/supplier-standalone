import { Icon } from "@iconify/react";
import { Box, SxProps } from "@mui/material";
// ----------------------------------------------------------------------

type IconifierProps = {
  icon: any;
  sx?: SxProps;
  other?: any;
};

export default function Iconifier({ icon, sx, ...other }: IconifierProps) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}
