import { MenuItem, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import es from "date-fns/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

const PluginStringFilter = ({
  label,
  filterValue,
  handleChange,
}: {
  label: string;
  filterValue: string;
  handleChange: (v: string) => void;
}) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      value={filterValue}
      onChange={(event) => handleChange(event.target.value)}
      sx={{ mx: 1, minWidth: { xs: 100, md: 200 } }}
    />
  );
};

const PluginNumberFilter = ({
  label,
  filterValue,
  handleChange,
}: {
  label: string;
  filterValue: string;
  handleChange: (v: string) => void;
}) => {
  return (
    <TextField
      type="number"
      label={label}
      variant="outlined"
      value={filterValue}
      onChange={(event) => handleChange(event.target.value)}
      sx={{ mx: 1, minWidth: { xs: 100, md: 200 } }}
    />
  );
};

const PluginStringOptsFilter = ({
  label,
  filterValue,
  handleChange,
  filterOptions,
}: {
  label: string;
  filterValue: string;
  handleChange: (v: string) => void;
  filterOptions: { key: string; label: string }[];
}) => {
  return (
    <TextField
      select
      label={label}
      variant="outlined"
      value={filterValue}
      onChange={(event) => {
        handleChange(event.target.value);
      }}
      sx={{ mx: 1, minWidth: { xs: 100, md: 200 } }}
    >
      {filterOptions.map((fo) => (
        <MenuItem value={fo.key}>{fo.label}</MenuItem>
      ))}
    </TextField>
  );
};

const PluginNumberOptsFilter = ({
  label,
  filterValue,
  handleChange,
  filterOptions,
}: {
  label: string;
  filterValue: number;
  handleChange: (v: number) => void;
  filterOptions: { key: number; label: string }[];
}) => {
  return (
    <TextField
      select
      label={label}
      variant="outlined"
      value={filterValue}
      onChange={(event) => {
        handleChange(Number(event.target.value));
      }}
      sx={{ mx: 1, minWidth: { xs: 100, md: 200 } }}
    >
      {filterOptions.map((fo) => (
        <MenuItem value={fo.key}>{fo.label}</MenuItem>
      ))}
    </TextField>
  );
};

const PluginDateFilter = ({
  label,
  filterValue,
  handleChange,
}: {
  label: string;
  filterValue: Date;
  handleChange: (v: Date) => void;
}) => {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      localeText={{ start: "Desde" }}
      adapterLocale={es}
    >
      <DatePicker
        label={label}
        openTo="day"
        format="dd/MM/yyyy"
        value={filterValue}
        onChange={(e) => {
          if (e) {
            handleChange(e);
          }
        }}
        sx={{ mx: 1 }}
      />
    </LocalizationProvider>
  );
};

export {
  PluginStringOptsFilter,
  PluginNumberOptsFilter,
  PluginStringFilter,
  PluginNumberFilter,
  PluginDateFilter,
};
