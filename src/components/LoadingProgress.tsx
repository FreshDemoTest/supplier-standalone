// material
import { styled } from "@mui/material/styles";
//
import { Box, CircularProgress } from "@mui/material";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export default function LoadingProgress({ ...other }) {
  return (
    <>
      <RootStyle {...other}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress color={other?.color || "primary"} />
        </Box>
      </RootStyle>
    </>
  );
}
