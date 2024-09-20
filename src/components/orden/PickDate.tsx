import { Box } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import es from "date-fns/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type PickDateSectionProps = {
  title: string;
  deliveryDate: Date | undefined;
  updateDateDetails: (dateDetail: string, value: any) => void;
  updateDateKey: string;
  editMode?: boolean;
  sx?: any;
};

const PickDateSection: React.FC<PickDateSectionProps> = ({
  title,
  deliveryDate,
  updateDateDetails,
  updateDateKey,
  sx,
}) => {
  return (
    <Box sx={sx}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        localeText={{ start: title }}
        adapterLocale={es}
      >
        <DatePicker
          label={title}
          openTo="day"
          defaultValue={deliveryDate ? new Date(deliveryDate) : undefined}
          // value={deliveryDate}
          onChange={(e: any) => updateDateDetails(updateDateKey, e)}
          sx={{ width: "100%" }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default PickDateSection;
