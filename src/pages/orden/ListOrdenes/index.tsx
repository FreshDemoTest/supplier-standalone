import { useEffect, useState } from "react";
// material
import { Grid, Typography, styled, useTheme } from "@mui/material";
//  hooks
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";
// components
import Page from "../../../components/Page";
import ListSalesOrdenesView from "./ListSalesOrdenes";
// utils
import { mixtrack } from "../../../utils/analytics";
import { isAllowedTo } from "../../../utils/permissions";
import MHidden from "../../../components/extensions/MHidden";
import FixedAddButton from "../../../components/footers/FixedAddButton";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------
type ListOrdenesPageProps = {
  viewMode: "ordenes" | "facturas";
  title: string;
  areLoaded: boolean;
  allowOrdenes?: boolean;
  allowFacturas?: boolean;
};

const ListOrdenesPage: React.FC<ListOrdenesPageProps> = ({
  viewMode,
  title,
  areLoaded = false,
  allowOrdenes = true,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <RootStyle title={title}>
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          mt: theme.spacing(1),
          mb: theme.spacing(1),
          px: theme.spacing(1),
        }}
      >
        <Grid item xs={12} lg={8}>
          {allowOrdenes && <ListSalesOrdenesView />}
          {!allowOrdenes && areLoaded && (
            <Grid
              container
              spacing={1}
              justifyContent={"center"}
              alignItems={"center"}
              sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
            >
              <Grid item xs={12} lg={8}>
                <Typography variant="h6">
                  No tienes acceso a esta sección
                </Typography>
                <Typography variant="body2">
                  Si crees que esto es un error, por favor contacta al
                  administrador.
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Mobile - Fixed add orden button */}
      <MHidden width="mdUp">
        <FixedAddButton
          buttonSize="medium"
          buttonMsg="Agregar Pedido"
          onClick={() => {
            navigate(PATH_APP.orden.add);
            mixtrack("add_orden_open", {
              visit: window.location.toString(),
              page: "ListOrdenes",
              section: "FixedAddButton",
            });
          }}
          sx={{
            bottom: { xs: 70, lg: 48 },
            left: { xs: "30%", md: "42%" },
          }}
        />
      </MHidden>
    </RootStyle>
  );
};

// ----------------------------------------------------------------------

type ListOrdenesViewProps = {
  viewMode: "ordenes";
};

const ListOrdenes: React.FC<ListOrdenesViewProps> = ({ viewMode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vmode, setVmode] = useState(viewMode);
  const navigate = useNavigate();
  const { loaded: permissionsLoaded, allowed } = useAppSelector(
    (state) => state.permission
  );
  const { isBusinessOnboarded } = useAppSelector((state) => state.account);

  // permissions
  const allowOrdenesList = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "ordenes-view-list")
    : true;

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowOrdenesList) {
      navigate(PATH_APP.notAllowed);
      mixtrack("ordenes_to_not_allowed_redirect", {
        visit: window.location.toString(),
        page: "ListOrdenes",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  return (
    <ListOrdenesPage
      title="Pedidos | Alima"
      viewMode={vmode}
      areLoaded={permissionsLoaded}
      allowOrdenes={allowOrdenesList}
    />
  );
};

export default ListOrdenes;
