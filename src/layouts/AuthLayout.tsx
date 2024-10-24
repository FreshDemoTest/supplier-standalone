import { Link as RouterLink } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
// components
import Logo from "../components/Logo";
import MHidden from "../components/extensions/MHidden";
import { PATH_APP } from "../routes/paths";
import track from "../utils/analytics";
//

// ----------------------------------------------------------------------

const HeaderStyle = styled("header")(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",
  position: "absolute",
  padding: theme.spacing(3),
  justifyContent: "space-between",
  [theme.breakpoints.up("md")]: {
    alignItems: "flex-start",
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

// ----------------------------------------------------------------------

type AuthLayoutProps = {
  pageName?: string;
  children?: any;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  pageName = "Auth",
  children,
}) => {
  return (
    <HeaderStyle>
      <RouterLink
        to={PATH_APP.root}
        onClick={() =>
          track("view_item", {
            visit: window.location.toString(),
            page: pageName,
            section: "AuthLayout",
          })
        }
      >
        <Logo width={140} />
      </RouterLink>

      <MHidden width="smDown">
        <Typography
          variant="body2"
          sx={{
            mt: { md: -2 },
          }}
        >
          {children}
        </Typography>
      </MHidden>
    </HeaderStyle>
  );
};

export default AuthLayout;
