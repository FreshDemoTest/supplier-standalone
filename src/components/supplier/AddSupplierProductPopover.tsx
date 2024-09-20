import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import PlusFill from "@iconify/icons-ic/add";
import DocFill from "@iconify/icons-ic/description";
import MoneyFill from "@iconify/icons-ic/outline-price-change";
import CheckListFill from "@iconify/icons-ic/baseline-checklist";
import baselineAddBox from '@iconify/icons-ic/baseline-add-box';
// material
import { MenuItem, Grid, useTheme, Button, Box } from "@mui/material";
// hooks
import { useNavigate } from "react-router";
// routes
import { PATH_APP } from "../../routes/paths";
// components
import MenuPopover from "../MenuPopover";
// styles
import { FooterBox } from "../../styles/footers/poweredBy";

// ----------------------------------------------------------------------

type AddSupplierProdsPopoverProps = {
  sectionType: "products" | "prices" | "stock";
};

const FixedAddSupplierProdsPopover: React.FC<AddSupplierProdsPopoverProps> = ({
  sectionType,
}) => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const options = [
    {
      label: "Crear Producto",
      section: "products",
      action: () => navigate(PATH_APP.catalog.product.add),
      icon: (
        <Icon
          icon={PlusFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Crear Lista de Precios",
      section: "prices",
      action: () => navigate(PATH_APP.catalog.price.addList),
      icon: (
        <Icon
          icon={CheckListFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Productos desde Excel",
      section: "products",
      action: () => navigate(PATH_APP.catalog.product.upload),
      icon: (
        <Icon
          icon={DocFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Lista de Precios desde Excel",
      section: "prices",
      action: () => navigate(PATH_APP.catalog.price.upload),
      icon: (
        <Icon
          icon={MoneyFill}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Inventario desde Excel",
      section: "stock",
      action: () => navigate(PATH_APP.catalog.stock.upload),
      icon: (
        <Icon
          icon={DocFill}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Inventario",
      section: "stock",
      action: () => navigate(PATH_APP.catalog.stock.addStock),
      icon: (
        <Icon
          icon={baselineAddBox}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    }
  ];

  return (
    <>
      <FooterBox
        position={"fixed"}
        sx={{
          left: { xs: "25%", md: "42%" },
          bottom: { xs: 70, lg: 48 },
          zIndex: 1000,
        }}
      >
        <Button
          startIcon={<Icon icon={PlusFill} width={28} height={28} />}
          onClick={handleOpen}
          size={"medium"}
          ref={anchorRef}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.secondary,
            boxShadow: theme.shadows[2],
            px: theme.spacing(2),
          }}
        >
          {sectionType === "prices" ? "Agregar Precios" : sectionType === "products" ? "Agregar Productos" : "Agregar Inventario"}
        </Button>
      </FooterBox>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 340 }}
      >
        {options
          .filter((op) => op.section === (sectionType as string))
          .map((option) => (
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

const AddSupplierProdsPopover: React.FC<AddSupplierProdsPopoverProps> = ({
  sectionType,
}) => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const options = [
    {
      label: "Crear Producto",
      section: "products",
      action: () => navigate(PATH_APP.catalog.product.add),
      icon: (
        <Icon
          icon={PlusFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Crear Lista de Precios",
      section: "prices",
      action: () => navigate(PATH_APP.catalog.price.addList),
      icon: (
        <Icon
          icon={CheckListFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Productos desde Excel",
      section: "products",
      action: () => navigate(PATH_APP.catalog.product.upload),
      icon: (
        <Icon
          icon={DocFill}
          width={20}
          height={20}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Lista de Precios desde Excel",
      section: "prices",
      action: () => navigate(PATH_APP.catalog.price.upload),
      icon: (
        <Icon
          icon={MoneyFill}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Inventario desde Excel",
      section: "stock",
      action: () => navigate(PATH_APP.catalog.stock.upload),
      icon: (
        <Icon
          icon={DocFill}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    },
    {
      label: "Dar Alta Inventario",
      section: "stock",
      action: () => navigate(PATH_APP.catalog.stock.addStock),
      icon: (
        <Icon
          icon={baselineAddBox}
          width={22}
          height={22}
          color={theme.palette.text.disabled}
        />
      ),
    }
  ];

  return (
    <>
      <Box sx={{ width: "100%", mx: theme.spacing(2) }}>
        <Button
          startIcon={<Icon icon={PlusFill} width={28} height={28} />}
          onClick={handleOpen}
          size="medium"
          fullWidth
          ref={anchorRef}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.secondary,
            boxShadow: theme.shadows[2],
          }}
        >
          {sectionType === "prices" ? "Agregar Precios" : sectionType === "products" ? "Agregar Productos" : "Agregar Inventario"}
        </Button>
      </Box>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current || undefined}
        sx={{ width: 340 }}
      >
        {options
          .filter((op) => op.section === (sectionType as string))
          .map((option) => (
            <MenuItem
              key={option.label}
              onClick={option.action}
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              <Grid container spacing={1}>
                <Grid item xs={8} lg={8} mt={0.5}>
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

export { AddSupplierProdsPopover };
export default FixedAddSupplierProdsPopover;
