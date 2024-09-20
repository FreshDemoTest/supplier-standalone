import * as Yup from "yup";
import { useEffect, useState } from "react";
// material
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
import {
  Stack,
  TextField,
  IconButton,
  Typography,
  useTheme,
  Grid,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
// redux
import {
  createSupplierPriceList,
  updateSupplierPriceList,
} from "../../redux/slices/supplier";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// components
import MultiSearchSelect, { MultiItemOption } from "../MultiSearchSelect";
import MHidden from "../extensions/MHidden";
import PickSupplierProductPriceSection from "./PickSupplierProductPrice";
// utils
import { delay, tomorrow } from "../../utils/helpers";
import { AlimaAPITokenError } from "../../errors";
// domain
import { UnitStateType } from "../../domain/account/SUnit";
import {
  PriceListDetailsType,
  SupplierPriceListStateType,
  SupplierPriceListType,
} from "../../domain/supplier/SupplierPriceList";
import { ClientBranchType } from "../../domain/client/Client";

// ----------------------------------------------------------------------
const defaultPriceList = "Lista General de Precios";

// ----------------------------------------------------------------------

type SupplierPriceListFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  priceListState?: SupplierPriceListStateType;
  priceLists: SupplierPriceListType[];
  editMode?: boolean;
};

const SupplierPriceListForm: React.FC<SupplierPriceListFormProps> = ({
  onSuccessCallback,
  priceListState = {
    listName: defaultPriceList,
    isDefault: false,
    resBranches: [],
    supUnitIds: [],
    validUntil: undefined,
    pricesDetails: [],
  },
  priceLists,
  editMode = false,
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const { units: AllUnits, isLoading: unitsLoading } = useAppSelector(
    (state) => state.account
  );
  const { activeClients, isLoading: clientsLoading } = useAppSelector(
    (state) => state.client
  );
  const dispatch = useAppDispatch();
  // aux state vars
  const [selectedUnits, setSelectedUnits] = useState<
    (MultiItemOption & { checked: boolean })[]
  >([]);
  const [selectedBranches, setSelectedBranches] = useState<
    (MultiItemOption & { checked: boolean })[]
  >([]);

  // filter only active units
  const units = AllUnits.filter((u: any) => !u.deleted);

  const BatchSupPricesSchema = Yup.object().shape({
    listName: !editMode
      ? Yup.string()
          .notOneOf(
            priceLists.map((pl) => pl.listName),
            "Ya existe una lista con el mismo nombre! Escoge otro."
          )
          .required("Debes ingresar un nombre para la lista.")
      : Yup.string().required("Debes ingresar un nombre para la lista."),
    isDefault: Yup.boolean(),
    resBranches: Yup.array().of(Yup.string()),
    supUnitIds: Yup.array()
      .of(Yup.string())
      .min(1, "Debes seleccionar al menos un CEDIS."),
    validUntil: Yup.date().required("Debes seleccionar una fecha de vigencia."),
    priceDetails: Yup.array().of(Yup.mixed()),
  });

  const formik = useFormik({
    initialValues: {
      ...priceListState,
    },
    validationSchema: BatchSupPricesSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // if no default and no branches selected - send warn msg
        const resLen = values?.resBranches?.length || 0;
        if (!values.isDefault && resLen === 0) {
          enqueueSnackbar(
            "Debes seleccionar al menos un cliente para la lista de precios.",
            {
              variant: "warning",
              action: (key) => (
                <IconButton
                  sx={{ position: "absolute", right: 1, top: 1 }}
                  size="small"
                  onClick={() => closeSnackbar(key)}
                >
                  <Icon icon={closeFill} />
                </IconButton>
              ),
            }
          );
          setSubmitting(false);
          return;
        }
        // if no prices details - send warn msg
        const formtPrices = (values?.pricesDetails || []).filter(
          (p) => p.price.price > 0
        );
        const pricesLen = formtPrices.length || 0;
        if (pricesLen === 0) {
          enqueueSnackbar("Debes poner al menos un precio en la lista.", {
            variant: "warning",
            action: (key) => (
              <IconButton
                sx={{ position: "absolute", right: 1, top: 1 }}
                size="small"
                onClick={() => closeSnackbar(key)}
              >
                <Icon icon={closeFill} />
              </IconButton>
            ),
          });
          setSubmitting(false);
          return;
        }
        // if prices have 0's - send warn msg
        const priceZeroes = (values?.pricesDetails || []).filter(
          (p) => (p.price.price === 0 || !p.price.price)
        );
        if (priceZeroes.length > 0) {
          enqueueSnackbar("Hay Productos con Precio Cero (0) en tu lista, por favor agrega un precio al producto o borralo de la lista.", {
            variant: "warning",
            action: (key) => (
              <IconButton
                sx={{ position: "absolute", right: 1, top: 1 }}
                size="small"
                onClick={() => closeSnackbar(key)}
              >
                <Icon icon={closeFill} />
              </IconButton>
            ),
          });
          setSubmitting(false);
          return;
        }

        // if editMode and valid until is less than tomorrow - send warn msg
        if (
          !values.validUntil ||
          (values.validUntil && editMode && values.validUntil < tomorrow())
        ) {
          enqueueSnackbar("La fecha de vigencia debe ser mayor a hoy.", {
            variant: "warning",
            action: (key) => (
              <IconButton
                sx={{ position: "absolute", right: 1, top: 1 }}
                size="small"
                onClick={() => closeSnackbar(key)}
              >
                <Icon icon={closeFill} />
              </IconButton>
            ),
          });
          setSubmitting(false);
          return;
        }
        const submitVals: any = {
          ...values,
        };
        if (!editMode) {
          // redux - add
          await dispatch(
            createSupplierPriceList(submitVals, sessionToken || "")
          );
        } else {
          await dispatch(
            updateSupplierPriceList(submitVals, sessionToken || "")
          );
        }
        await delay(1000);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error) {
        console.error(error);
        let errmsg = `Error ${
          editMode ? "actualizando" : "creando"
        } tus precios.`;
        if (error instanceof AlimaAPITokenError) {
          errmsg = "Error de conexión, recarga la página e intenta de nuevo!";
        }
        enqueueSnackbar(errmsg, {
          variant: "error",
          action: (key) => (
            <IconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </IconButton>
          ),
        });
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    setFieldValue,
  } = formik;
  const isFormFull = values.listName !== "" && values.validUntil;
  const noErrors =
    Object.keys(errors).filter((e) => {
      if (values.isDefault && e === "listName") return false;
      return true;
    }).length === 0;

  const datePickProps = getFieldProps("validUntil");

  // delete from price list
  const deleteFromPriceList = (prDet: PriceListDetailsType) => {
    const newPricesDetails = [...values.pricesDetails].filter(
      (pd) => pd.sku !== prDet.sku
    );
    setFieldValue("pricesDetails", newPricesDetails);
  };

  // set price in price list
  const setPriceInPriceList = (prDet: PriceListDetailsType) => {
    const newPricesDetails = [...values.pricesDetails].map((pd) => {
      if (pd.sku === prDet.sku) {
        return prDet;
      }
      return pd;
    });
    setFieldValue("pricesDetails", newPricesDetails);
  };

  // addd price in price list
  const addPriceToPriceList = (prDet: PriceListDetailsType) => {
    const newPricesDetails = [prDet, ...values.pricesDetails];
    setFieldValue("pricesDetails", newPricesDetails);
  };

  // on change isDefault checkbox
  useEffect(
    () => {
      if (values.isDefault) {
        setFieldValue("listName", defaultPriceList);
        setFieldValue("resBranches", []);
      } else {
        if (!editMode) {
          setFieldValue("listName", "");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.isDefault]
  );

  // onChange selected units
  useEffect(
    () => {
      const selectedUnitsIds = selectedUnits.map((u) => u.id);
      setFieldValue("supUnitIds", selectedUnitsIds);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedUnits]
  );

  // onChange selected clients
  useEffect(
    () => {
      const selectedBranchesIds = selectedBranches.map((u) => u.id);
      setFieldValue("resBranches", selectedBranchesIds);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedBranches]
  );

  // hook - set clients
  useEffect(() => {
    if (editMode && selectedBranches.length === 0) {
      const selectCls = activeClients
        .filter(
          (u: ClientBranchType) =>
            u.id && (priceListState.resBranches || []).includes(u.id)
        )
        .map((u: ClientBranchType) => ({
          id: u.id,
          title: u.branchName,
          subtitle: u.fullAddress,
        }));
      setSelectedBranches(selectCls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClients, editMode]);

  // hook - set units
  useEffect(() => {
    if (editMode && selectedUnits.length === 0) {
      const _units = AllUnits.filter((u: UnitStateType) => !u.deleted);
      const selectCls = _units
        .filter(
          (u: UnitStateType) =>
            u.id && (priceListState.supUnitIds || []).includes(u.id)
        )
        .map((u: UnitStateType) => ({
          id: u.id,
          title: u.unitName,
          subtitle: u.fullAddress,
        }));
      setSelectedUnits(selectCls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AllUnits, editMode]);

  // render var
  // show for Add Mode and Edit Mode only for isDefault = true
  const showIsDefault = !editMode || (editMode && values.isDefault);

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: 3 }}>
          {errors.listName && isFormFull && (
            <Alert severity="error">
              {editMode
                ? errors.listName
                : "Tu Lista de Precios por Defecto, ya existe."}
            </Alert>
          )}
          {/* Checkbox por defecto */}
          {showIsDefault && (
            <Grid container>
              <Grid item xs={2} lg={1} sx={{ textAlign: "center" }}>
                <Checkbox
                  {...getFieldProps("isDefault")}
                  checked={values.isDefault}
                  color="primary"
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={10} lg={11}>
                <Typography
                  variant="subtitle1"
                  color={"text.secondary"}
                  sx={{
                    mt: theme.spacing(1),
                    fontWeight: theme.typography.fontWeightLight,
                  }}
                >
                  Lista de Precios por Defecto
                </Typography>
              </Grid>
            </Grid>
          )}

          <Grid container>
            <Grid
              item
              xs={12}
              md={!values.isDefault ? 6 : 0}
              sx={{ pr: { xs: 0, md: 2 } }}
            >
              {!values.isDefault && (
                <TextField
                  fullWidth
                  disabled={editMode}
                  label="Nombre Lista de Precio"
                  {...getFieldProps("listName")}
                  error={Boolean(touched.listName && errors.listName)}
                  helperText={touched.listName && errors.listName}
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ pt: { xs: 2, md: 0 }, pl: { xs: 0, md: 2 } }}
            >
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                localeText={{ start: "Precios válidos hasta" }}
              >
                <DatePicker
                  label="Precios válidos hasta"
                  minDate={tomorrow()}
                  disablePast={true}
                  openTo="day"
                  defaultValue={
                    editMode && datePickProps.value
                      ? new Date(datePickProps.value)
                      : tomorrow()
                  }
                  onChange={(e: any) => {
                    setFieldValue("validUntil", e);
                  }}
                  slotProps={{
                    actionBar: {
                      actions: [],
                    },
                  }}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Grid container>
            <Grid
              item
              xs={12}
              md={!values.isDefault ? 6 : 9}
              sx={{ pr: { xs: 0, md: 2 } }}
            >
              {/* Select Units */}
              <MultiSearchSelect
                sectionTitle="Selecciona CEDIS a aplicar precios"
                searchHint="Buscar CEDIS"
                pickedItems={selectedUnits}
                setPickedItems={setSelectedUnits}
                itemOptions={units.map((u: UnitStateType) => ({
                  id: u.id,
                  title: u.unitName,
                  subtitle: u.fullAddress,
                }))}
                maxHeight={240}
                selectionMsg={
                  selectedUnits.length > 0
                    ? `${selectedUnits.length} CEDIS seleccionado(s)`
                    : undefined
                }
                filterViewSelected
                loading={unitsLoading}
                sortValsDefault={editMode}
              />
            </Grid>

            <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 2 } }}>
              {/* Select branches */}
              {!values.isDefault && (
                <>
                  <MHidden width="smUp">
                    <Divider sx={{ my: theme.spacing(2) }} />
                  </MHidden>
                  <MultiSearchSelect
                    filterViewSelected
                    loading={clientsLoading}
                    sectionTitle="Asigna lista de precios a los Clientes"
                    searchHint="Buscar Clientes"
                    noItemsText={
                      activeClients.length === 0
                        ? `¡No tienes ningún cliente activo! 
                          Activa algún cliente, o da de alta tu Lista de Precio por Defecto.`
                        : undefined
                    }
                    pickedItems={selectedBranches}
                    setPickedItems={setSelectedBranches}
                    itemOptions={activeClients.map((u: ClientBranchType) => ({
                      id: u.id,
                      title: u.branchName,
                      subtitle: u.fullAddress,
                    }))}
                    maxHeight={240}
                    selectionMsg={
                      selectedBranches.length > 0
                        ? `${selectedBranches.length} cliente(s) seleccionado(s)`
                        : undefined
                    }
                    sortValsDefault={editMode}
                  />
                </>
              )}
            </Grid>
          </Grid>

          <PickSupplierProductPriceSection
            title="Define los Precios de tu lista"
            priceDetails={values.pricesDetails}
            onDelete={deleteFromPriceList}
            onSetPrice={setPriceInPriceList}
            addPrice={addPriceToPriceList}
          />
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 2 }}>
          <i>{values.pricesDetails.length} Producto(s)</i>
          </Typography>

          <Divider sx={{ my: theme.spacing(2) }} />

          <Grid container>
            <Grid item xs={0} md={3} />
            <Grid item xs={12} md={6}>
              <LoadingButton
                fullWidth
                disabled={!noErrors || !isFormFull}
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {editMode
                  ? "Actualizar Lista de Precios"
                  : "Crear Lista de Precios"}
              </LoadingButton>
            </Grid>
            <Grid item xs={0} md={3} />
          </Grid>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default SupplierPriceListForm;
