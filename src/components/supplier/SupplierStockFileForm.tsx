import * as Yup from "yup";
import { ChangeEvent, useEffect, useState } from "react";
// material
import { Icon } from "@iconify/react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// redux
import { setBatchSupplierProductStockFile } from "../../redux/slices/supplier";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// components
import MultiSearchSelect, { MultiItemOption } from "../MultiSearchSelect";
// utils
import { delay } from "../../utils/helpers";
import { AlimaAPITokenError } from "../../errors";
// domain
import { UnitStateType } from "../../domain/account/SUnit";
import { SupplierProductStockUploadStateType } from "../../domain/supplier/SupplierProductStock";

// ----------------------------------------------------------------------

type SupplierProductStockFileFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  productStockState?: SupplierProductStockUploadStateType;
};

const SupplierProductStockFileForm: React.FC<SupplierProductStockFileFormProps> = ({
  onSuccessCallback,
  productStockState = {
    xlsxProductStockListData: undefined,
    supUnitIds: [],
  },
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const { units: AllUnits, isLoading: unitsLoading } = useAppSelector(
    (state) => state.account
  );
  const dispatch = useAppDispatch();
  // aux state vars
  const [selectedUnits, setSelectedUnits] = useState<
    (MultiItemOption & { checked: boolean })[]
  >([]);
  const [filePrices, setFilePrices] = useState<File | undefined>(
    productStockState.xlsxProductStockListData
  );
  const fileMap = {
    xlsxProductStockListData: filePrices,
  };

  // filter only active units
  const units = AllUnits.filter((u: any) => !u.deleted);

  const handleFileProductsUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilePrices(e.target.files[0]);
      // call formik onchange to validat
      stockProps.onChange(e);
    }
  };

  const BatchSupPricesSchema = Yup.object().shape({
    xlsxProductStockListData: Yup.mixed().required(
      "No has cargado el archivo de inventarios."
    ),
    supUnitIds: Yup.array()
      .of(Yup.string())
      .min(1, "Debes seleccionar al menos un CEDIS."),
  });

  const formik = useFormik({
    initialValues: {
      ...productStockState,
      xlsxProductStockListData: undefined,
    },
    validationSchema: BatchSupPricesSchema,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // if no default and no branches selected - send warn msg
        const submitVals: any = {
          ...values,
          ...fileMap,
        };
        // redux
        await dispatch(
          setBatchSupplierProductStockFile(submitVals, sessionToken || "")
        );
        await delay(1000);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error) {
        console.error(error);
        let errmsg = "Error cargando tu inventario.";
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
  const isFormFull =
    values.xlsxProductStockListData;
    const noErrors = Object.keys(errors).length === 0;

  const stockProps = getFieldProps("xlsxProductStockListData");

  // onChange selected units
  useEffect(
    () => {
      const selectedUnitsIds = selectedUnits.map((u) => u.id);
      setFieldValue("supUnitIds", selectedUnitsIds);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedUnits]
  );

  // hook - set units
  useEffect(() => {
    if (selectedUnits.length === 0) {
      const _units = AllUnits.filter((u: UnitStateType) => !u.deleted);
      const selectCls = _units
        .filter(
          (u: UnitStateType) =>
            u.id && (productStockState.supUnitIds || []).includes(u.id)
        )
        .map((u: UnitStateType) => ({
          id: u.id,
          title: u.unitName,
          subtitle: u.fullAddress,
        }));
      setSelectedUnits(selectCls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AllUnits]);


  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: 3 }}>
          {/* Select Units */}
          <MultiSearchSelect
            filterViewSelected
            sectionTitle="Selecciona CEDIS a aplicar inventario"
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
            loading={unitsLoading}
            sortValsDefault={false}
          />

          <Divider sx={{ my: theme.spacing(2) }} />

          <TextField
            fullWidth
            type="file"
            label="Carga de Inventario"
            {...getFieldProps("xlsxProductStockListData")}
            onChange={handleFileProductsUpload}
            error={Boolean(
              touched.xlsxProductStockListData && errors.xlsxProductStockListData
            )}
            helperText={touched.xlsxProductStockListData && errors.xlsxProductStockListData}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UploadFileIcon />
                </InputAdornment>
              ),
              componentsProps: {
                input: {
                  accept: ".xlsx",
                },
              },
            }}
          />

          <LoadingButton
            fullWidth
            disabled={!noErrors || !isFormFull}
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Cargar Inventario
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default SupplierProductStockFileForm;
