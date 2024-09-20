import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import es from "date-fns/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import { FormControl, Grid, MenuItem, TextField, styled } from "@mui/material";
import { fISODate } from "../../utils/helpers";

// ----------------------------------------------------------------------

const StyledForm = styled(FormControl)(({ theme }) => ({
  "& .MuiTextField-root": {
    mx: theme.spacing(1),
    width: "25ch",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));

// ----------------------------------------------------------------------

export type DataReportsFiltersProps = {
  supplier_business: string[];
  desde: string;
  hasta: string;
  periodo: "week" | "month";
};

const DataReportsFilters: React.FC<
  DataReportsFiltersProps & { callback: (v: any) => void }
> = ({ desde, hasta, periodo = "week", callback }) => {
  const [period, setPeriod] = useState<string>("week"); // ["week", "month"
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(
    new Date()
  );
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(new Date());

  // hooks
  useEffect(() => {
    setPeriod(periodo);
    setSelectedDateFrom(new Date(desde));
    setSelectedDateTo(new Date(hasta));
  }, [periodo, desde, hasta]);

  // handlers
  const handleDateFromChange = (date: Date | null) => {
    setSelectedDateFrom(date);
    callback({
      desde: fISODate(date),
    });
  };

  const handleDateToChange = (date: Date | null) => {
    setSelectedDateTo(date);
    callback({
      hasta: fISODate(date),
    });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(e.target.value);
    callback({
      periodo: e.target.value,
    });
  };

  return (
    <StyledForm>
      <Grid container>
        <Grid item xs={12} md={4} sx={{ pr: 3, pb: 1 }}>
          <TextField
            select
            label="Periodo"
            variant="outlined"
            value={period}
            onChange={handlePeriodChange}
          >
            <MenuItem value="week">Semanal</MenuItem>
            <MenuItem value="month">Mensual</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6} sm={4} sx={{ pr: 3, pb: 1, mt: { xs: 0.5, md: 0 } }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            localeText={{ start: "Desde" }}
            adapterLocale={es}
          >
            <DatePicker
              label="Desde"
              openTo="day"
              format="dd/MM/yyyy"
              value={selectedDateFrom}
              onChange={handleDateFromChange}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6} sm={4} sx={{ mt: { xs: 0.5, md: 0 } }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            localeText={{ start: "Hasta" }}
            adapterLocale={es}
          >
            <DatePicker
              label="Hasta"
              openTo="day"
              format="dd/MM/yyyy"
              value={selectedDateTo}
              onChange={handleDateToChange}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </StyledForm>
  );
};

// ----------------------------------------------------------------------

export type CollectionsReportFiltersProps = {
  restaurant_branch_id: string;
  restaurantOptions: { label: string; value: string }[];
};

export const CollectionsReportFilters: React.FC<
  CollectionsReportFiltersProps & { callback: (v: any) => void }
> = ({ restaurant_branch_id, restaurantOptions, callback }) => {
  const [selectedClient, setSelectedClient] = useState<string>("");

  // hooks
  useEffect(() => {
    setSelectedClient(restaurant_branch_id);
  }, [restaurant_branch_id]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClient(e.target.value);
    callback({
      restaurant_branch_id: e.target.value,
    });
  };
  return (
    <StyledForm>
      <Grid container>
        <Grid item xs={12} md={4} sx={{ pr: 3, pb: 1 }}>
          <TextField
            select
            label="Cliente"
            variant="outlined"
            value={selectedClient}
            onChange={handleClientChange}
          >
            {restaurantOptions.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </StyledForm>
  );
};

export default DataReportsFilters;
