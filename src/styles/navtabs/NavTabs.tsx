import { Tab, Tabs, styled } from "@mui/material";

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  color: theme.palette.info.main,
  "& .Mui-selected": {
    color: theme.palette.info.main,
  },
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.error.dark,
  },
  "& .MuiTab-root": {
    textTransform: "none",
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.subtitle1.fontSize,
  },
  "& .MuiTab-root.Mui-selected": {
    color: theme.palette.error.dark,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

export const STab = styled(Tab)(({ theme }) => ({
  minWidth: theme.spacing(20),
  [theme.breakpoints.up("md")]: {
    minWidth: theme.spacing(30),
  },
}));

export const S3Tab = styled(Tab)(({ theme }) => ({
  minWidth: theme.spacing(15),
  [theme.breakpoints.up("md")]: {
    minWidth: theme.spacing(26),
  },
}));

export const S4Tab = styled(Tab)(({ theme }) => ({
  minWidth: theme.spacing(12),
  [theme.breakpoints.up("md")]: {
    minWidth: theme.spacing(26),
  },
}));
