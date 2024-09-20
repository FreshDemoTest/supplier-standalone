import { Box, styled } from "@mui/material";

export const DataCardStyleSm = styled(Box)(({ theme }) => ({
  height: 180,
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[10],
  margin: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflowY: "hidden",
}));

export const DataCardStyleLg = styled(Box)(({ theme }) => ({
  height: 500,
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[10],
  margin: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflowY: "hidden",
}));

export const DataCardStyleMd = styled(Box)(({ theme }) => ({
  height: 300,
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[10],
  margin: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflowY: "hidden",
}));
