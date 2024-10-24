import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import PlusFill from "@iconify/icons-ic/add";
// material
import { MenuItem, Grid, useTheme, IconButton } from "@mui/material";
// hooks
import { useNavigate } from "react-router";
// routes
import { PATH_APP } from "../../routes/paths";
// components
import MenuPopover from "../MenuPopover";
// styles
import { FooterBox } from "../../styles/footers/poweredBy";
import track from "../../utils/analytics";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const AddOrdenPopover: React.FC = () => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleOpen = () => {
    setOpen(true);
    track("add_to_cart", {
      visit: window.location.toString(),
      page: "Ordenes",
      section: "FixedAddButton",
    });
  };
  const handleClose = () => {
    setOpen(false);
  };

  const options = [
    {
      label: "Crear Pedido",
      action: () => {
        navigate(PATH_APP.orden.add);
        track("add_to_cart", {
          visit: window.location.toString(),
          page: "Ordenes",
          section: "FixedAddButtonMenu",
        });
      },
      icon: (
        <Icon
          icon={PlusFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
  ];

  return (
    <>
      <FooterBox
        position={"fixed"}
        sx={{
          left: "45%",
          bottom: { xs: 84, lg: 48 },
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={handleOpen}
          size={"medium"}
          ref={anchorRef}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.common.black,
            boxShadow: theme.shadows[2],
          }}
        >
          <Icon icon={PlusFill} width={32} height={32} />
        </IconButton>
      </FooterBox>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 220 }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.label}
            onClick={option.action}
            sx={{ typography: "body2", py: 1, px: 2.5 }}
          >
            <Grid container spacing={1}>
              <Grid item xs={8} lg={8}>
                {option.label}
              </Grid>
              <Grid item xs={4} lg={4} textAlign={"right"}>
                {option.icon}
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </MenuPopover>
    </>
  );
};

export default AddOrdenPopover;
