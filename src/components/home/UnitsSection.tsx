import { useEffect, useState } from "react";
// material
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import PlusFill from "@iconify/icons-ic/add";
// components
import UnitCardItem from "../account/UnitCardItem";
import SearchBar from "../SearchBar";
import MHidden from "../extensions/MHidden";
import { Icon } from "@iconify/react";
import { PATH_APP } from "../../routes/paths";
import track from "../../utils/analytics";
import { useNavigate } from "react-router";

export type UnitsSectionProps = {
  units: Array<any>;
};

const UnitsSection: React.FC<UnitsSectionProps> = ({ units }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [_units, setUnits] = useState(units);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // filter deleted units
    const __units = units.filter((b) => !b.deleted);
    if (search) {
      const searchRegex = new RegExp(search, "i");
      const filteredUnits = __units.filter(
        (un) =>
          un.unitName.match(searchRegex) || un.fullAddress.match(searchRegex)
      );
      setUnits(filteredUnits);
    } else {
      setUnits(__units);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // hook
  useEffect(() => {
    // filter deleted units
    const __units = units.filter((b) => !b.deleted);
    setUnits(__units);
  }, [units]);

  // [TODO] - add filter to turn on and off view of deleted units.
  return (
    <Grid
      container
      spacing={1}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{ mt: theme.spacing(1), px: theme.spacing(2) }}
    >
      <Grid item xs={12} md={9}>
        {/* Search bar */}
        {units.length !== 0 && (
          <SearchBar
            placeholder="Buscar CEDIS"
            searchValue={search}
            searchCallback={setSearch}
            searchResultsLength={_units.length}
          />
        )}
      </Grid>
      <Grid item xs={12} md={3}>
        {/* Desktop only */}
        <MHidden width="mdDown">
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              size="medium"
              startIcon={
                <Icon
                  icon={PlusFill}
                  width={24}
                  height={24}
                  color={theme.palette.text.secondary}
                />
              }
              onClick={() => {
                navigate(PATH_APP.account.unit.add);
                track("select_item", {
                  visit: window.location.toString(),
                  section: "SearchBar",
                  page: "BusinessAccount",
                });
              }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.secondary,
                boxShadow: theme.shadows[2],
                px: theme.spacing(2),
              }}
            >
              Agregar CEDIS
            </Button>
          </Box>
        </MHidden>
      </Grid>
      <Grid item xs={12} md={12}>
        {units.length === 0 && (
          <Box sx={{ my: theme.spacing(2) }}>
            <Typography variant="h6" align="center">
              No hay CEDIS registrados.
            </Typography>
            <Typography variant="body2" align="center" color={"text.secondary"}>
              Da click en el botón de la esquina inferior derecha (+) para
              agregar un CEDIS.
            </Typography>
          </Box>
        )}

        {/* List units */}
        {units.length !== 0 && (
          <Box sx={{ my: theme.spacing(2) }}>
            {_units.map((b) => (
              <UnitCardItem key={b.id} unit={b} />
            ))}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default UnitsSection;
