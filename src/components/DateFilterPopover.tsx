import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import CalendarFill from "@iconify/icons-ic/date-range";
// material
import {
  Box,
  Button,
  Grid,
  IconButton,
  useTheme,
} from "@mui/material";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import es from "date-fns/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
// hooks
// routes
// components
import BasicDialog from "./navigation/BasicDialog";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type DateFilterPopoverProps = {
  dateFilterState: { start: Date | null; end: Date | null };
  action: (selected: any) => void;
};

const DateFilterPopover: React.FC<DateFilterPopoverProps> = ({
  dateFilterState,
  action,
}) => {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterStore, setFilterStore] = useState(dateFilterState);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleOnChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "start" | "end"
  ) => {
    setFilterStore({
      ...filterStore,
      [key]: event,
    });
  };

  const handleOnApply = () => {
    const _filterState = { ...filterStore };
    action(_filterState);
    handleClose();
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          px: 1,
        }}
      >
        <Icon icon={CalendarFill} width={28} height={28} />
      </IconButton>

      {/* No selected dialog */}
      <BasicDialog
        open={open}
        title="Rangos de Fecha"
        msg="Escoge el rango de los días de entrega."
        closeMark={true}
        onClose={handleClose}
        props={{ mt: { xs: 0, md: -30 } }}
      >
        <Grid container sx={{ marginTop: 2, marginBottom: 2, marginLeft: -1 }}>
          <Grid item xs={6} sx={{ pr: theme.spacing(1) }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              localeText={{ start: "Selecciona Fecha" }}
              adapterLocale={es}
            >
              <DatePicker
                label="Desde "
                openTo="day"
                format="dd/MM/yyyy"
                value={filterStore.start}
                onChange={(e: any) => handleOnChange(e, "start")}
                slotProps={{
                  actionBar: {
                    // The actions will be the same between desktop and mobile
                    actions: ["accept"],
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              localeText={{ start: "Selecciona Fecha" }}
              adapterLocale={es}
            >
              <DatePicker
                label="Hasta"
                openTo="day"
                format="dd/MM/yyyy"
                value={filterStore.end}
                onChange={(e: any) => handleOnChange(e, "end")}
                slotProps={{
                  actionBar: {
                    // The actions will be the same between desktop and mobile
                    actions: ["accept"],
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box sx={{ pt: 2, textAlign: "right" }}>
          <Button 
            variant="contained" 
            size={"medium"} 
            disabled={filterStore.start === null || filterStore.end === null}
            onClick={handleOnApply}>
            Aplicar
          </Button>
        </Box>
      </BasicDialog>
    </>
  );
};

export default DateFilterPopover;
