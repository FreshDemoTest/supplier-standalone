import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import es from "date-fns/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers";
import {
  generateSupplierTimeOptions,
  inTwoWeeks,
  inXTime,
  isDisabledDay,
} from "../../utils/helpers";
import {
  UnitDeliveryInfoType,
  UnitStateType,
} from "../../domain/account/SUnit";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type PickDeliveryDateSectionProps = {
  pickedUnit: UnitStateType & UnitDeliveryInfoType;
  deliveryDate: Date;
  deliveryTime?: string;
  comments?: string;
  withDeliveryTime?: boolean;
  withDeliveryComments?: boolean;
  updateDeliveryDetails: (deliveryDetail: string, value: any) => void;
  editMode?: boolean;
  sx?: any;
};

const PickDeliveryDateSection: React.FC<PickDeliveryDateSectionProps> = ({
  pickedUnit,
  deliveryDate,
  deliveryTime = undefined,
  comments = undefined,
  withDeliveryTime = true,
  withDeliveryComments = true,
  updateDeliveryDetails,
  editMode = false,
  sx,
}) => {
  const theme = useTheme();

  const handleDisabledDates = (date: Date) => {
    const dayDis = isDisabledDay(date, pickedUnit.deliverySchedules);
    const resp = dayDis;
    return resp;
  };

  const supDeliveryTimeWindowOptions = generateSupplierTimeOptions(
    deliveryDate,
    pickedUnit.deliverySchedules,
    pickedUnit.deliveryWindowSize || 1
  );

  return (
    <Card sx={{ ...sx }}>
      <CardHeader title="Escoge fecha de entrega" />
      <CardContent>
        <Grid container>
          <Grid
            item
            xs={12}
            md={12}
            sx={{
              pr: theme.spacing(1),
            }}
          >
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                localeText={{ start: "Selecciona Fecha de Entrega" }}
                adapterLocale={es}
              >
                <StaticDatePicker
                  minDate={!editMode ? inXTime(0) : undefined}
                  maxDate={inTwoWeeks()}
                  shouldDisableDate={handleDisabledDates}
                  openTo="day"
                  defaultValue={
                    deliveryDate ? new Date(deliveryDate) : undefined
                  }
                  // value={deliveryDate}
                  onChange={(e: any) =>
                    updateDeliveryDetails("deliveryDate", e)
                  }
                  slotProps={{
                    actionBar: {
                      actions: [],
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Grid>
        </Grid>
        {!deliveryDate && (
          <Alert severity="info">
            Para ver los horarios, selecciona una fecha de entrega
          </Alert>
        )}
        {withDeliveryTime && supDeliveryTimeWindowOptions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Escoge tu horario de entrega.
            </Typography>
            <TextField
              fullWidth
              select
              label="Ventana de Horario de Entrega"
              value={deliveryTime}
              onChange={(e: any) =>
                updateDeliveryDetails("deliveryTime", e.target.value)
              }
            >
              {supDeliveryTimeWindowOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
        {withDeliveryComments && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Algún comentario para la entrega?
            </Typography>
            <TextField
              value={comments}
              onChange={(e: any) =>
                updateDeliveryDetails("comments", e.target.value)
              }
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PickDeliveryDateSection;
