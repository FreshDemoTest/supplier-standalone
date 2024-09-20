// material
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { useFormik, Form, FormikProvider } from "formik";
import closeFill from "@iconify/icons-eva/close-fill";
import {
  Stack,
  IconButton,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// redux
import {
  createSupplierStockList
} from "../../redux/slices/supplier";
// hooks
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useAuth from "../../hooks/useAuth";
// utils
import { delay } from "../../utils/helpers";
import { AlimaAPITokenError } from "../../errors";
import {
  PriceListDetailsType,
  SupplierStockListType,
} from "../../domain/supplier/SupplierPriceList";
import { SupplierProductType } from "../../domain/supplier/SupplierProduct";
import PickSupplierProductStockSection from "./PickSupplierProductStock";

// ----------------------------------------------------------------------

type SupplierStockListFormProps = {
  onSuccessCallback: (flag: boolean) => void;
  stockListsState:  SupplierStockListType;
  stockLists: SupplierProductType[];
};

const SupplierStockListForm: React.FC<SupplierStockListFormProps> = ({
  onSuccessCallback,
  stockListsState,
  stockLists,
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { activeUnit } = useAppSelector((state) => state.account);

  const formik = useFormik({
    initialValues: {...stockListsState},
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        const stockLen = values.stock.length || 0;
        if (stockLen === 0) {
          enqueueSnackbar("Debes poner al menos un producto en tu inventario.", {
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
        const submitVals: any = {
          ...values,
        };
        
        // redux - add
        await dispatch(
          createSupplierStockList(submitVals, [activeUnit.id], sessionToken || "",)
        );
        await delay(1000);
        // action
        setSubmitting(false);
        onSuccessCallback(true);
      } catch (error) {
        console.error(error);
        let errmsg = `Error creando inventario`;
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
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = formik;

  // set price in price list
  const setStockInStockList = (psDet: SupplierProductType) => {
    const newStockDetails = [...values.stock].map((pd: SupplierProductType) => {
      if (pd.id === psDet.id) {
        return psDet;
      }
      return pd;
    });
    setFieldValue("stock", newStockDetails);
  };

  // addd price in price list
  const addStockToStockList = (psDet: PriceListDetailsType) => {
    const newStockDetails = [psDet, ...values.stock];
    setFieldValue("stock", newStockDetails);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ mt: 3 }}>

          <PickSupplierProductStockSection
            title="Define el inventario de tu lista"
            stockDetails={values.stock}
            onSetStock={setStockInStockList}
            addStock={addStockToStockList}
          />
          <Divider sx={{ my: theme.spacing(2) }} />

          <Grid container>
            <Grid item xs={0} md={3} />
            <Grid item xs={12} md={6}>
              <LoadingButton
                fullWidth
                disabled={values.stock.length === 0}
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {"Agregar inventario"}
              </LoadingButton>
            </Grid>
            <Grid item xs={0} md={3} />
          </Grid>
        </Stack>
      </Form>
    </FormikProvider>
  );
};

export default SupplierStockListForm;
