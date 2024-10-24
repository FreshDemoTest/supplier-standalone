import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
// material
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
  Link,
  Grid,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// hooks
import useAuth from "../../hooks/useAuth";
// redux
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setNewOrdenClient } from "../../redux/slices/orden";
import {
  getClientCategories,
  getClientProfileToOrden,
} from "../../redux/slices/client";
// routes
import { PATH_APP } from "../../routes/paths";
// components
import SearchBar from "../SearchBar";
import ClientCardItem from "../client/ClientCardItem";
import LoadingProgress from "../LoadingProgress";
import {
  GroupHeader,
  GroupItems,
} from "../../styles/forms/AutoCompleteHeaderItems";
// domain
import { ClientProfileType } from "../../domain/client/Client";
// utils
import track from "../../utils/analytics";
import { normalizeText } from "../../utils/helpers";

// ----------------------------------------------------------------------

type PickClientSectionProps = {
  pickedClient: ClientProfileType | undefined;
  clients: ClientProfileType[];
  sx?: any;
  disabled?: boolean;
  variant?: "card" | "multiselect";
};

const PickClientSection: React.FC<PickClientSectionProps> = ({
  pickedClient,
  clients,
  sx,
  disabled,
  variant = "card",
}) => {
  const { sessionToken } = useAuth();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const { clientCategories, clientToOrden } = useAppSelector(
    (state) => state.client
  );
  const { activeUnit } = useAppSelector((state) => state.account);
  const [isSupCatalogLoading, setIsSupCatalogLoading] = useState(false);

  useEffect(() => {
    if (clientCategories.length === 0) {
      dispatch(getClientCategories());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // search filter
  const filteredClients = clients.filter((clt) => {
    if (search === "") {
      return true;
    } else {
      return (
        normalizeText(clt.branchName).includes(normalizeText(search)) ||
        (clt.clientCategory &&
          normalizeText(clt.clientCategory).includes(normalizeText(search))) ||
        (clt.displayName &&
          normalizeText(clt.displayName).includes(normalizeText(search)))
      );
    }
  });

  const getClientProfileToOrdenWrapper = async (
    clientId: string,
    sToken: string
  ) => {
    await dispatch(getClientProfileToOrden(activeUnit.id, clientId, sToken));
    setIsSupCatalogLoading(false);
  };

  // select client
  const selectClient = (client: ClientProfileType) => {
    if (disabled) return;
    setIsSupCatalogLoading(true);
    getClientProfileToOrdenWrapper(client?.id || "", sessionToken || "");
  };

  // hook - on change Orden client
  useEffect(() => {
    if (disabled) return;
    if (clientToOrden) {
      dispatch(setNewOrdenClient(clientToOrden));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientToOrden]);

  // deselect client
  const deselectClient = () => {
    if (disabled) return;
    dispatch(setNewOrdenClient({}));
  };

  // category from selected Client
  const pickedClientCateg = pickedClient?.branchName
    ? clientCategories.find((c: any) => c.value === pickedClient.clientCategory)
    : undefined;

  if (variant === "card") {
    return (
      <Card sx={{ ...sx }}>
        <CardHeader title="Selecciona Cliente" />
        <CardContent>
          {!pickedClient?.branchName && (
            <>
              {/* Search bar */}
              <SearchBar
                placeholder="Buscar cliente..."
                searchValue={search}
                searchCallback={setSearch}
                searchResultsLength={filteredClients.length}
              />
              {/* List of Clients */}
              <Box sx={{ mt: 1, maxHeight: 240, overflowY: "scroll" }}>
                {filteredClients.map((sup) => (
                  <Box key={sup.id} sx={{ mt: 1, ml: 0.5, mr: 1.5 }}>
                    <ClientCardItem
                      client={sup}
                      categories={clientCategories}
                      onClick={() => selectClient(sup)}
                      cardType="cart"
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
          {pickedClient?.branchName && (
            <Box sx={{ mx: 1.5 }}>
              <ClientCardItem
                client={pickedClient}
                categories={clientCategories}
                onClick={() => deselectClient()}
                cardType="cart"
                other={{ checked: true }}
              />
            </Box>
          )}
          {clients.length === 0 && !disabled && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mt: 1, fontWeight: theme.typography.fontWeightRegular }}
              align="center"
            >
              No hay clientes registrados,{" "}
              <Link
                component={RouterLink}
                to={PATH_APP.client.add.form}
                onClick={() => {
                  track('view_item', {
                    visit: window.location.toString(),
                    page: "AddOrden",
                    section: "PickClient",
                  });
                }}
              >
                da de alta
              </Link>{" "}
              uno nuevo para continuar.
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  } else {
    // variant === 'multiselect'
    return (
      <Grid container>
        <Grid item xs={12} md={12}>
          <Typography variant="h6" sx={{ ml: 1, mb: 2 }} color="text.secondary">
            Selecciona Cliente
          </Typography>
          <Autocomplete
            fullWidth
            disabled={disabled}
            disableListWrap={disabled}
            readOnly={disabled}
            id="grouped-client-select"
            options={filteredClients.sort(
              (a, b) =>
                -`${b?.business?.clientName} - ${b.branchName}`.localeCompare(
                  `${a?.business?.clientName} - ${a.branchName}`
                )
            )}
            groupBy={(option) =>
              `${option?.business?.clientName} - ${option.branchName}`[0].toUpperCase()
            }
            getOptionLabel={(option) => {
              return option?.branchName
                ? `${option?.business?.clientName} - ${option.branchName}`
                : "";
            }}
            value={pickedClient || undefined}
            isOptionEqualToValue={(option, value) => {
              return option?.id === value?.id;
            }}
            sx={{ mb: 1 }}
            renderInput={(params) => <TextField {...params} label="Clientes" />}
            renderGroup={(params) => (
              <li key={params.key}>
                <GroupHeader>{params.group}</GroupHeader>
                <GroupItems>{params.children}</GroupItems>
              </li>
            )}
            noOptionsText={
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1, fontWeight: theme.typography.fontWeightRegular }}
                align="center"
              >
                No hay clientes registrados,{" "}
                <Link
                  component={RouterLink}
                  to={PATH_APP.client.add.form}
                  onClick={() => {
                    track('add_to_cart', {
                      visit: window.location.toString(),
                      page: "AddOrden",
                      section: "PickClient",
                    });
                  }}
                >
                  da de alta
                </Link>{" "}
                uno nuevo para continuar.
              </Typography>
            }
            onChange={(
              event: React.SyntheticEvent,
              value: ClientProfileType | null
            ) => {
              if (value) {
                selectClient(value);
              } else {
                deselectClient();
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          {pickedClient?.branchName && !isSupCatalogLoading && (
            <Chip
              label={`(${pickedClientCateg?.label}) ${pickedClient?.business?.clientName} - ${pickedClient.branchName}`}
              color="primary"
              size="small"
              sx={{
                fontWeight: theme.typography.fontWeightMedium,
                mb: 2,
              }}
              icon={<CheckCircleRoundedIcon color="primary" />}
              variant="outlined"
            />
          )}
        </Grid>
        <Grid item xs={12} md={12}>
          {isSupCatalogLoading && <LoadingProgress sx={{ mt: 0, mb: 4 }} />}
        </Grid>
      </Grid>
    );
  }
};

export default PickClientSection;
