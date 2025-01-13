import { useEffect } from "react";
// material
import { Grid, styled, useTheme } from "@mui/material";
//  hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../redux/store";
// styles
// components
import Page from "../../../components/Page";
import ListActiveClientsView from "./ListActiveClients";
// utils
import { isAllowedTo } from "../../../utils/permissions";
import track from "../../../utils/analytics";
// routes
import { PATH_APP } from "../../../routes/paths";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListClientsPageProps = {
  viewMode: "active" | "marketplace";
  title: string;
};

const ListClientsPage: React.FC<ListClientsPageProps> = ({
  viewMode,
  title,
}) => {
  const theme = useTheme();
  return (
    <RootStyle title={title} sx={{ mt: 0, pt: 0 }}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ mb: theme.spacing(1), px: theme.spacing(1.5) }}
      >
        <Grid item xs={12} lg={8}>
          <ListActiveClientsView />
        </Grid>
      </Grid>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListClientsViewProps = {
  viewMode: "active" | "marketplace";
};

const ListClients: React.FC<ListClientsViewProps> = ({ viewMode }) => {
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowClientsList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "clients-view-list")
    : true;
  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowClientsList) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "ListClients",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]); // [TOREV] @jorgeviz
  return <ListClientsPage title="Clientes | Alima" viewMode={viewMode} />;
};

export default ListClients;
