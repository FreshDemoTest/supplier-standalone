import { ReactNode, useEffect, useState } from "react";
// material
import {
  FormikErrors,
  FieldInputProps,
  FormikTouched,
  FormikValues,
} from "formik";
import {
  Stack,
  TextField,
  MenuItem,
  Grid,
  Theme,
  Typography,
  IconButton,
  Button,
  TableHead,
  TableRow,
  TableCell,
  Box,
  Checkbox,
  SxProps,
  useTheme,
  alpha,
} from "@mui/material";
import { Icon } from "@iconify/react";
import TimerOutline from "@iconify/icons-ic/outline-timer";
import InfoOutline from "@iconify/icons-ic/outline-info";
// components
import MultiSelect, { GroupedMultiSelect } from "../MultiSelect";
import BasicDialog from "../navigation/BasicDialog";
// domain
import { DeliveryZones, DoW, ServiceDayType } from "../../domain/account/SUnit";
import { DeliveryTypes } from "../../domain/supplier/SupplierProduct";
import { enqueueSnackbar } from "notistack";
import { fOperationDays } from "../../utils/helpers";
import { DynamicTableLoader } from "../DynamicLoader";

// ----------------------------------------------------------------------

type OperationDaysModalFormProps = {
  open: boolean;
  onClose: () => void;
  operationDays: ServiceDayType[];
  setOperationDays: (days: ServiceDayType[]) => void;
};

const OperationDaysModalForm: React.FC<OperationDaysModalFormProps> = ({
  open,
  onClose,
  operationDays,
  setOperationDays,
}) => {
  const [locOpDay, setLocOpDay] = useState<
    { dow: string; start?: number; end?: number }[]
  >(
    Object.keys(DoW).map((o) => ({
      dow: o,
      start: undefined,
      end: undefined,
    }))
  );
  const opsDaysIdx = operationDays.map((d) => d.dow);

  useEffect(() => {
    // update local operation days
    operationDays.forEach((day) => {
      const idx = locOpDay.findIndex((v) => v.dow === day.dow);
      if (idx === -1) return;
      locOpDay[idx] = day;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationDays]);

  const handleAddOpsDay = (day: {
    dow: keyof typeof DoW;
    start?: number;
    end?: number;
  }) => {
    const isDeselecting = opsDaysIdx.includes(day.dow);
    if (isDeselecting) {
      // unchecked
      setOperationDays(operationDays.filter((v) => v.dow !== day.dow));
      return;
    }
    // data validation
    if (!day.start || !day.end) {
      enqueueSnackbar(`Selecciona un horario de operación de ${DoW[day.dow]}`, {
        variant: "error",
      });
      return;
    }
    if (day.start && (day.start < 0 || day.start > 23)) {
      enqueueSnackbar(`Hora de inicio no válida, debe ser entre 0 y 23hrs.`, {
        variant: "warning",
      });
      return;
    }
    if (day.end && (day.end < 1 || day.end > 24)) {
      enqueueSnackbar(`Hora de inicio no válida, debe ser entre 1 y 24hrs.`, {
        variant: "warning",
      });
      return;
    }
    if (day.start >= day.end) {
      enqueueSnackbar(
        `El horario de operación de ${DoW[day.dow]} no es válido.`,
        {
          variant: "warning",
        }
      );
      return;
    }
    // add new day
    const newOpsDay = {
      ...day,
    } as ServiceDayType;
    setOperationDays([...operationDays, newOpsDay]);
  };

  const updateLocOpDay = (day: {
    dow: keyof typeof DoW;
    start?: number;
    end?: number;
  }) => {
    // add info
    const newLocOpDay = [...locOpDay];
    const idx = newLocOpDay.findIndex((v) => v.dow === day.dow);
    if (idx === -1) return;
    newLocOpDay[idx] = day;
    setLocOpDay(newLocOpDay);
  };

  return (
    <BasicDialog
      title="Días de Operación"
      msg="Selecciona los días en los que operas, y horarios donde estarás disponible para entregar pedidos."
      open={open}
      onClose={onClose}
      closeMark={true}
      continueAction={{
        active: true,
        msg: "Guardar",
        actionFn: () => {
          const _opDays = [...operationDays];
          locOpDay.forEach((day) => {
            const idx = _opDays.findIndex((v) => v.dow === day.dow);
            if (idx === -1 || !day.start || !day.end) return;
            _opDays[idx] = {
              start: day.start,
              end: day.end,
              dow: day.dow as keyof typeof DoW,
            };
          });
          setOperationDays(_opDays);
          onClose();
        },
      }}
      backAction={{
        active: true,
        msg: "Cancelar",
        actionFn: () => {
          setOperationDays([]);
          onClose();
        },
      }}
    >
      <Box sx={{ my: 2 }}>
        {Object.entries(DoW).map((d) => {
          const day = d[0] as keyof typeof DoW;
          const label = d[1] as string;
          const opDay = locOpDay.find((v) => v.dow === day);
          const startTime = opDay ? opDay.start : undefined;
          const endTime = opDay ? opDay.end : undefined;
          return (
            <Grid container key={day} sx={{ px: { xs: 0, md: 2 }, py: 1 }}>
              <Grid item xs={0} lg={1}></Grid>
              <Grid item xs={3} lg={2}>
                <Typography variant="body1" sx={{ pt: 0.5 }}>
                  {label}
                </Typography>
              </Grid>
              <Grid item xs={3} lg={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Inicio (24h)"
                  size="small"
                  value={startTime === 0 ? undefined : startTime}
                  onChange={(e) => {
                    updateLocOpDay({
                      dow: day,
                      start: Number(e.target.value),
                      end: endTime,
                    });
                  }}
                />
              </Grid>
              <Grid item xs={1} lg={1}>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 0.5 }}
                >{` - `}</Typography>
              </Grid>
              <Grid item xs={3} lg={3}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Fin (24h)"
                  value={endTime === 0 ? undefined : endTime}
                  onChange={(e) => {
                    updateLocOpDay({
                      dow: day,
                      start: startTime,
                      end: Number(e.target.value),
                    });
                  }}
                />
              </Grid>
              <Grid item xs={2} lg={2}>
                <Checkbox
                  checked={opsDaysIdx.includes(day)}
                  onChange={() =>
                    handleAddOpsDay({
                      dow: day,
                      start: startTime,
                      end: endTime,
                    })
                  }
                />
              </Grid>
            </Grid>
          );
        })}
      </Box>
    </BasicDialog>
  );
};

const OperationDaysSelector: React.FC<{
  operationDays: ServiceDayType[];
  onChange: (days: ServiceDayType[]) => void;
}> = ({ operationDays, onChange }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [opDays, setOpDays] = useState<ServiceDayType[]>(operationDays);

  useEffect(
    () => {
      onChange(opDays);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opDays]
  );

  const opDaysStrs = fOperationDays(operationDays);

  const opsDaysSx: SxProps =
    operationDays.length === 0
      ? {
          border: "1px solid",
          borderColor: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.light, 0.3),
          borderRadius: 1,
          py: 1,
          px: 2,
        }
      : {};

  return (
    <>
      {/* Dialog Selector */}
      <OperationDaysModalForm
        open={open}
        onClose={() => setOpen(false)}
        operationDays={opDays}
        setOperationDays={setOpDays}
      />

      {/* Components */}
      <Grid
        container
        sx={{
          py: 1,
          ...opsDaysSx,
        }}
      >
        <Grid item xs={7} lg={8} color="text.secondary" sx={{ pr: 2 }}>
          {operationDays.length === 0 && (
            <Box>
              <Typography variant="subtitle2">
                <b>Sin días de Operación.</b>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Configura tus días y horarios de operación.
              </Typography>
            </Box>
          )}
          {opDaysStrs.length > 0 && (
            <Box>
              <Typography variant="subtitle2">
                <b>Horario de Operación</b>
              </Typography>
              {opDaysStrs.map((op, k) => (
                <Typography key={k} variant="body2" color="text.secondary">
                  {op}
                </Typography>
              ))}
            </Box>
          )}
        </Grid>
        <Grid item xs={5} lg={4}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => setOpen(true)}
            endIcon={<Icon icon={TimerOutline} color="white" width={24} />}
            sx={{ ml: 1, mt: 1 }}
          >
            Agregar
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

// ----------------------------------------------------------------------

type DeliverySUnitFormProps = {
  theme: Theme;
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<FormikErrors<FormikValues>> | Promise<void>;
  touched: FormikTouched<FormikValues>;
  errors: FormikErrors<FormikValues>;
  defaultValues?: { [key: string]: any };
  editMode?: boolean;
};

const DeliverySUnitForm: React.FC<DeliverySUnitFormProps> = ({
  theme,
  getFieldProps,
  setFieldValue,
  touched,
  errors,
  defaultValues,
  editMode = false,
}) => {
  const [openZonesInfo, setOpenZonesInfo] = useState(false);

  // handlers
  const handleChangeOperationDays = (days: ServiceDayType[]) => {
    setFieldValue("deliverySchedules", days);
  };

  // compute window size options
  const wSizeOptionsNum = (
    getFieldProps("deliverySchedules").value?.map((dS: any) => {
      return dS.end - dS.start;
    }) || []
  ).reduce((acc: number, curr: number) => {
    if (curr < acc) return curr;
    return acc;
  }, 8);

  // render
  return (
    <>
      {/* Zones Info modal */}
      <BasicDialog
        title="Zonas de Entrega"
        msg="Éstas son las zonas de entrega, y las correspondientes coberturas de cada una de ellas."
        open={openZonesInfo}
        onClose={() => setOpenZonesInfo(false)}
        closeMark={true}
      >
        <DynamicTableLoader
          scrollIncrement={30}
          colSpan={3}
          elements={DeliveryZones.sort((dz1, dz2) => {
            return `${dz1.estate} ${dz1.zoneName}`.localeCompare(
              `${dz2.estate} ${dz2.zoneName}`
            );
          })}
          containerSx={{
            minHeight: { xs: 600, md: 600 },
          }}
          headers={
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightBold,
                  }}
                >
                  Estado
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightBold,
                  }}
                >
                  Zona
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightBold,
                  }}
                >
                  Cobertura
                </TableCell>
              </TableRow>
            </TableHead>
          }
          renderMap={(dzs) => {
            return dzs.map((row) => (
              <TableRow key={row.zoneName}>
                <TableCell align="center">{row.estate}</TableCell>
                <TableCell align="center">
                  {row.zoneName.split(",")[0]}
                </TableCell>
                <TableCell align="center">{row.city}</TableCell>
              </TableRow>
            ));
          }}
        ></DynamicTableLoader>
      </BasicDialog>
      {/* Delivery info Form */}
      <Stack spacing={2}>
        <MultiSelect
          label="Tipos de Entrega"
          {...getFieldProps("deliveryTypes")}
          options={Object.entries(DeliveryTypes).map((v) => ({
            key: v[0],
            value: v[1],
          }))}
          onChange={(e: any) => {
            setFieldValue("deliveryTypes", e.target.value);
          }}
        />

        <OperationDaysSelector
          operationDays={getFieldProps("deliverySchedules").value}
          onChange={handleChangeOperationDays}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Escoge tu promesa de entrega, y define cada cuanta horas te
          comprometes a entregar los productos.
        </Typography>

        <Grid container>
          <Grid item xs={11} lg={11} sx={{ pr: theme.spacing(2) }}>
            <GroupedMultiSelect
              label="Zonas de Entrega"
              {...getFieldProps("deliveryZones")}
              options={DeliveryZones.map((v) => ({
                key: v.zoneName,
                value: v.zoneName,
                group: v.estate,
              }))}
              onChange={(e: any) => {
                setFieldValue("deliveryZones", e);
              }}
            />
          </Grid>
          <Grid item xs={1} lg={1}>
            <IconButton
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setOpenZonesInfo(true)}
            >
              <Icon icon={InfoOutline} color="grey" width={24} />
            </IconButton>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          select
          label="Ventanas de Entrega (en horas)"
          {...getFieldProps("deliveryWindowSize")}
          error={Boolean(
            touched.deliveryWindowSize && errors.deliveryWindowSize
          )}
          helperText={
            (touched.deliveryWindowSize &&
              errors.deliveryWindowSize) as ReactNode
          }
        >
          {/* Range from 1 to 8 */}
          {Array.from(Array(wSizeOptionsNum - 1).keys())
            .map((v) => v + 1)
            .map((option) => (
              <MenuItem key={option} value={option}>
                {`Cada ${option} hrs.`}
              </MenuItem>
            ))}
        </TextField>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Escoge con cuanta anticipación permitirás a los clientes mandar sus
          pedidos, y la hora de corte.
        </Typography>
        <Grid container>
          <Grid item xs={7} lg={7} sx={{ pr: theme.spacing(2) }}>
            <TextField
              fullWidth
              select
              label="Aviso Previo"
              {...getFieldProps("warnDays")}
              error={Boolean(touched.warnDays && errors.warnDays)}
              helperText={(touched.warnDays && errors.warnDays) as ReactNode}
            >
              {[
                { value: 1, label: "Un día antes" },
                { value: 2, label: "Dos días antes" },
                { value: 3, label: "Tres días antes" },
                { value: 4, label: "Cuatro días antes" },
                { value: 5, label: "Cinco días antes" },
                { value: 6, label: "Seis días antes" },
                { value: 7, label: "Siete días antes" },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={5} lg={5}>
            <TextField
              fullWidth
              select
              label="Hora de Corte"
              {...getFieldProps("cutOffTime")}
              error={Boolean(touched.cutOffTime && errors.cutOffTime)}
              helperText={
                (touched.cutOffTime && errors.cutOffTime) as ReactNode
              }
            >
              {Array.from(Array(10).keys())
                .map((v) => v + 2)
                .map((option) => (
                  <MenuItem key={option} value={option}>
                    {`${option} p.m.`}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default DeliverySUnitForm;
