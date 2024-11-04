import { Box, Typography } from "@mui/material";
import {
  APPBAR_MOBILE,
  FooterBox,
  PoweredTypo,
} from "../../styles/footers/poweredBy";
import Logo from "../Logo";

const FloatingPoweredByAlima = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{ textAlign: "center", mt: 0.5 }}
        color="text.disabled"
      >
        Powered by
      </Typography>
      <Logo
        height={APPBAR_MOBILE * 0.7}
        width={APPBAR_MOBILE * 1}
        paddingTop={0}
        sx={{ ml: 1 }}
      />
    </Box>
  );
};

export default function PoweredByAlima() {
  const handleForceReload = () => {
    window.location.reload();
  };
  return (
    <FooterBox position={"fixed"} sx={{ backgroundColor: "common.white" }}>
      <PoweredTypo variant="h6">{"Powered by "}</PoweredTypo>
      {/* <Logo
        height={APPBAR_MOBILE * 1.6}
        width={APPBAR_MOBILE * 1.8}
        sx={{ mt: 1 }}
        {...{ onClick: handleForceReload }}
      /> */}
    </FooterBox>
  );
}

export { FloatingPoweredByAlima };