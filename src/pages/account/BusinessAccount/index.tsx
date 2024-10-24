import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
// material
import { styled } from "@mui/material/styles";
import { useTheme, Box, Grid, Typography } from "@mui/material";
// styles
import { S4Tab, StyledTabs } from "../../../styles/navtabs/NavTabs";
// hooks
import { useAppSelector } from "../../../redux/store";
// routes
import { PATH_APP } from "../../../routes/paths";
// components
import Page from "../../../components/Page";
import EditBusinessAccount from "./EditBusinessAccount";
import ListTeam from "./ListTeam";
import LegalInfo from "./LegalInfo";
import UnitsSection from "../../../components/home/UnitsSection";
// utils
import { getUnitsAllowed, isAllowedTo } from "../../../utils/permissions";
import track from "../../../utils/analytics";
import { UnitStateType } from "../../../domain/account/SUnit";
import usePermissions from "../../../hooks/usePermissions";
import FixedAddButton from "../../../components/footers/FixedAddButton";
import MHidden from "../../../components/extensions/MHidden";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

type BusinessTabType = "business" | "units" | "personal" | "legal";

export default function BusinessAccount() {
  const theme = useTheme();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BusinessTabType>("business");
  const [localUnits, setLocalUnits] = useState<UnitStateType[]>([]);
  const { loaded: permissionsLoaded, allowed } = usePermissions();
  const { isBusinessOnboarded, units } = useAppSelector(
    (state) => state.account
  );
  // permissions
  const allowEditAccount = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-account-edit")
    : true;
  const allowUnitAdmin = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-unit-view-list")
    : true;
  const allowAddUnit = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-unit-add")
    : true;
  const allowEditLegal = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-account-legal")
    : true;
  const allowPersonel = isBusinessOnboarded
    ? isAllowedTo(allowed?.unitPermissions, "usersadmin-view-list")
    : true;

  // handling hash at URL to set viewMode
  useEffect(() => {
    if (hash) {
      if (hash === "#business") {
        setActiveTab("business");
      } else if (hash === "#personal") {
        setActiveTab("personal");
      } else if (hash === "#units") {
        setActiveTab("units");
      } else {
        setActiveTab("legal");
      }
    }
  }, [hash]);

  // handlers
  const changeTab = (newValue: BusinessTabType) => {
    // edit business account tab is disabled
    if (newValue === "business" && !allowEditAccount) return;
    // edit units tab is disabled
    if (newValue === "units" && !allowUnitAdmin) return;
    // edit legal tab is disabled
    if (newValue === "legal" && !allowEditLegal) return;
    // edit personal tab is disabled
    if (newValue === "personal" && !allowPersonel) return;
    // change tab
    navigate(`#${newValue}`);
  };

  // fetch units
  useEffect(() => {
    if (!units || units.length === 0) return;
    // filtered units with actual accessons
    const _units = getUnitsAllowed(units, allowed?.unitPermissions).filter(
      (u) => !u.deleted
    );
    setLocalUnits(_units as UnitStateType[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, allowed]);

  // redirect to not allowed if doesn't have access
  useEffect(() => {
    if (permissionsLoaded && !allowEditAccount) {
      navigate(PATH_APP.notAllowed);
      track("exception", {
        visit: window.location.toString(),
        page: "BusinessAccount",
        section: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoaded, allowed]);

  const handleChange = (event: any, newValue: BusinessTabType) => {
    changeTab(newValue);
    track("select_content", {
      visit: window.location.toString(),
      page: "BusinessAccount",
      section: "NavTabs",
      tab: newValue,
    });
  };

  return (
    <RootStyle title="Editar Cuenta | Alima">
      <Grid
        container
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{ mb: theme.spacing(1), px: theme.spacing(1) }}
      >
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <Box sx={{ flexGrow: 1, mt: 0.5, px: 1 }}>
              <Typography variant="h4" gutterBottom>
                Configuración de Cuenta
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {" "}
                Información del Negocio, CEDIS, y personal con respectivos
                permisos autorizados en cada CEDIS.
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Box>
            <StyledTabs
              value={activeTab}
              onChange={handleChange}
              aria-label="info business account tabs"
              centered
            >
              <S4Tab
                disabled={!allowEditAccount}
                value="business"
                label="Negocio"
              />
              <S4Tab disabled={!allowUnitAdmin} value="units" label="CEDIS" />
              <S4Tab
                disabled={!allowPersonel}
                value="personal"
                label="Personal"
              />
              <S4Tab disabled={!allowEditLegal} value="legal" label="Legal" />
            </StyledTabs>
          </Box>
          <Box sx={{ px: 1 }}>
            {activeTab === "business" && <EditBusinessAccount />}
            {activeTab === "units" && (
              <>
                <UnitsSection units={localUnits} />
                {allowAddUnit && (
                  <>
                    <MHidden width="mdUp">
                      {/* Only Mobile */}
                      <FixedAddButton
                        onClick={() => {
                          navigate(PATH_APP.account.unit.add);
                          track("select_content", {
                            visit: window.location.toString(),
                            page: "BusinessAccount",
                            section: "FixedAddUnit",
                          });
                        }}
                        buttonSize={"medium"}
                        buttonMsg={"Agregar CEDIS"}
                        sx={{
                          bottom: { xs: 70, lg: 48 },
                          left: { xs: "30%", md: "42%" },
                        }}
                      />
                    </MHidden>
                  </>
                )}
              </>
            )}
            {activeTab === "personal" && <ListTeam />}
            {activeTab === "legal" && <LegalInfo />}
          </Box>
        </Grid>
      </Grid>
    </RootStyle>
  );
}
