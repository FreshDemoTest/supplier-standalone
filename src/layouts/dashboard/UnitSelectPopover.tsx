import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import downRowCircleOutline from "@iconify/icons-ic/outline-arrow-drop-down-circle";
// material
import {
  Button,
  Box,
  MenuItem,
  useTheme,
  Typography,
  List,
  ListItemButton,
} from "@mui/material";
// routes
// redux
import { setActiveUnitSuccess } from "../../redux/slices/account";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
// components
import MenuPopover from "../../components/MenuPopover";
import MAvatar from "../../components/extensions/MAvatar";
import createAvatar from "../../utils/createAvatar";
// domain
import { UnitType } from "../../domain/account/SUnit";
// utils
import track from "../../utils/analytics";

// ----------------------------------------------------------------------
type ListUnitOptionsProps = {
  unitOptions: UnitType[];
  onSelect: (unit: UnitType) => void;
};

const ListUnitOptions: React.FC<ListUnitOptionsProps> = ({
  unitOptions,
  onSelect,
}) => {
  const theme = useTheme();
  return (
    <List sx={{ mt: theme.spacing(2) }}>
      {unitOptions.map((option: any) => (
        <ListItemButton
          key={`${option.unitName}-${option.id}`}
          onClick={() => onSelect(option)}
        >
          <Box
            component={Icon}
            sx={{
              mr: 2,
              width: 24,
              height: 24,
            }}
          >
            <MAvatar
              src={""}
              alt={option.unitName}
              color={createAvatar(option.unitName).color}
              {...{ variant: "circular" }}
            >
              {createAvatar(option.unitName).name}
            </MAvatar>
            <Typography variant="body2" noWrap sx={{ ml: theme.spacing(2) }}>
              {option.unitName}
            </Typography>
          </Box>
        </ListItemButton>
      ))}
    </List>
  );
};

// ----------------------------------------------------------------------

type UnitSelectPopoverProps = {
  units: UnitType[];
};

export default function UnitSelectPopover({ units }: UnitSelectPopoverProps) {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { activeUnit } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = (unit: any | undefined) => {
    if (unit) {
      dispatch(setActiveUnitSuccess(unit));
      track("select_content", {
        unitId: unit?.id || "",
        unitName: unit?.unitName || "",
        visit: window.location.toString(),
        page: "",
        section: "UnitSelectPopover",
      });
    }
    setOpen(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {activeUnit && (
        <Button
          ref={anchorRef}
          onClick={handleOpen}
          sx={{
            textTransform: "none",
            letterSpacing: 0,
            px: theme.spacing(3),
            ml: theme.spacing(5),
            borderRadius: theme.spacing(4),
            color: theme.palette.text.secondary,
            fontWeight: theme.typography.fontWeightRegular,
            backgroundColor: theme.palette.primary.light,
            zIndex: 100,
          }}
          startIcon={
            <Icon
              icon={downRowCircleOutline}
              width={20}
              height={20}
              style={{ color: theme.palette.text.secondary }}
            />
          }
        >
          {activeUnit?.unitName || "Selecciona un CEDIS"}
        </Button>
      )}

      <MenuPopover
        open={open}
        onClose={() => handleClose(undefined)}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 300, py: theme.spacing(1) }}
      >
        {units.map((option: any) => (
          <MenuItem
            key={`${option.unitName}-${option.id}`}
            onClick={() => handleClose(option)}
            sx={{ typography: "body2", py: 1, px: 2.5 }}
          >
            <Box
              component={Icon}
              sx={{
                mr: 2,
                width: 24,
                height: 24,
                textAlign: "center",
              }}
            >
              <MAvatar
                src={""}
                alt={option.unitName}
                color={createAvatar(option.unitName).color}
                {...{ variant: "circular" }}
              >
                {createAvatar(option.unitName).name}
              </MAvatar>
              <Typography variant="body2" noWrap sx={{ ml: theme.spacing(2) }}>
                {option.unitName}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </MenuPopover>
    </div>
  );
}

export { ListUnitOptions };
