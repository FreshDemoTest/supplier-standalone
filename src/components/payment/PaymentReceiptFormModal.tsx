import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
  Checkbox,
} from "@mui/material";
import {
  PaymentReceiptOrdenType,
  PaymentReceiptType,
} from "../../domain/orden/Orden";
// hooks
import { useAppDispatch } from "../../redux/store";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import DragDropFiles from "../DragDropFiles";
import track from "../../utils/analytics";
import { useSnackbar } from "notistack";
import { updatePayReceipt, uploadPayReceipt } from "../../redux/slices/orden";
import useAuth from "../../hooks/useAuth";
import PickDateSection from "../orden/PickDate";

type PaymentReceiptFormProps = {
  open: boolean;
  onClose: (a: boolean) => void;
  payReceipt?: PaymentReceiptType;
  editMode?: boolean;
};

const PaymentReceiptFormModal: React.FC<PaymentReceiptFormProps> = ({
  open,
  onClose,
  payReceipt = {
    id: undefined,
    paymentValue: undefined,
    evidenceFile: undefined,
    paymentDay: undefined,
    comments: "",
    ordenes: [],
  },
  editMode = false,
}) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const labels: { [key: string]: string } = {
    paymentValue: "Monto del Pago",
    evidenceFile: "Evidencia (opcional)",
    paymentDay: "Fecha de pago (opcional)",
    comments: "Comentarios (opcional)",
    ordenes: "Pedidos asociados:",
  };
  const [receipt, setReceipt] = useState<PaymentReceiptType>(payReceipt);
  const [files, setFiles] = useState<FileList | null>(null); // files to upload
  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);
  const [formFull, setFormFull] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [complementCheck, setComplementCheck] = useState(false);

  // hook - on update payreceipt value
  useEffect(() => {
    const cpPayReceipt = { ...payReceipt, evidenceFile: undefined };
    if (payReceipt.evidenceFile) {
      const dTransfer = new DataTransfer();
      dTransfer.items.add(payReceipt.evidenceFile);
      setFiles(dTransfer.files);
    }
    setReceipt(cpPayReceipt);
  }, [payReceipt]);

  // hook - on change receipt verify form full
  useEffect(() => {
    const _formFull =
      receipt.paymentValue !== undefined &&
      receipt.ordenes !== undefined &&
      receipt?.ordenes?.length > 0;
    setFormFull(_formFull);
  }, [receipt]);

  const clearErrors = () => {
    setErrors([]);
  };

  const validateMultiple = (value: any) => {
    const _rec = { ...receipt };
    value = parseFloat(value).toFixed(2);
    _rec["paymentValue" as keyof PaymentReceiptType] = value;
    setReceipt(_rec);
  };

  const handleUpdateReceiptState = (key: string, value: any) => {
    if (key === "paymentValue" && value.toString() === "NaN") {
      const _err = [...errors];
      const _errIndex = _err.findIndex((e) => e.key === key);
      if (_errIndex >= 0) {
        _err[_errIndex] = { key, value: "El monto debe ser un número." };
      } else {
        _err.push({ key, value: "El monto debe ser un número." });
      }
      setErrors(_err);
      return;
    }
    const _rec = { ...receipt };
    // if (key === "paymentValue")
    //   value = parseFloat(value).toFixed(2)
    _rec[key as keyof PaymentReceiptType] = value;
    setReceipt(_rec);
    if (errors.length > 0) clearErrors();
  };

  const validateInputs = () => {
    if (receipt.paymentValue === undefined) {
      setErrors([
        ...errors,
        { key: "paymentValue", value: "El monto es requerido." },
      ]);
      return false;
    }
    if (files !== null && files.length === 0) {
      setErrors([
        ...errors,
        { key: "ordenes", value: "Debes seleccionar el archivo de evidencia." },
      ]);
      return false;
    }
    return true;
  };

  const handleComplementCheckChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setComplementCheck(event.target.checked);
  };

  const handleUploadPayment = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    track("view_item", {
      visit: window.location.toString(),
      page: "OrdenDetails",
      section: "PaymentDetails",
      ordenIds: payReceipt?.ordenes?.map((o) => o.ordenId),
    });
    try {
      const currentDate = new Date();
      const _ordIds: string[] =
        payReceipt?.ordenes
          ?.map((o) => o.ordenId)
          .filter((o): o is string => o !== undefined) || [];
      if (!editMode) {
        await dispatch(
          uploadPayReceipt(
            sessionToken || "",
            _ordIds,
            receipt?.paymentValue || 0, // provide a default value of 0 if paymentValue is undefined
            receipt?.paymentDay || undefined, // provide a default value of current date if paymentDay is undefined,
            receipt.comments,
            files?.item(0) || undefined,
            complementCheck
          )
        );
      } else {
        await dispatch(
          updatePayReceipt(
            sessionToken || "",
            payReceipt.id || "",
            _ordIds,
            receipt?.paymentValue || 0, // provide a default value of 0 if paymentValue is undefined
            receipt?.paymentDay || currentDate, // provide a default value of current date if paymentDay is undefined,
            receipt.comments,
            files?.item(0) || undefined,
            complementCheck
          )
        );
      }
      enqueueSnackbar("Comprobante de pago se guardó correctamente", {
        variant: "success",
        autoHideDuration: 1000,
      });
      onClose(true);
      setLoading(false);
    } catch (error: any) {
      switch (error.message) {
        case "Error: This order is not invoiced":
          enqueueSnackbar(
            "No es posible añadir complemento de pago, la orden no tiene factura",
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
          break;
        case "Error: This order is not avalible to add complement, is PUE":
          enqueueSnackbar(
            "No es posible añadir complemento de pago a la factura PUE",
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
          break;
        default:
          enqueueSnackbar("Error al cargar comprobante de pago", {
            variant: "error",
            autoHideDuration: 2000,
          });
          break;
      }

      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="add-payment-rec-dialog"
      aria-describedby="add-payment-rec-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "700px",
          maxHeight: { xs: "95vh", md: "85vh" },
          height: { xs: "95vh", md: "85vh" },
        },
      }}
    >
      <DialogTitle
        id="add-payment-rec-dialog"
        variant="h6"
        color="text.primary"
        sx={{ mt: 1, ml: 1 }}
      >
        {editMode
          ? `Edita el Comprobante de Pago`
          : `Agrega Comprobante de Pago`}
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{ mt: { xs: 3, md: 3 } }}>
          <Grid item xs={12} md={12}>
            <Stack spacing={{ xs: 2, md: 2 }}>
              <Grid container>
                <Grid item xs={0} md={2} />
                <Grid item xs={12} md={8}>
                  <Grid container>
                    {/* Monto */}
                    <Grid
                      item
                      xs={12}
                      md={5}
                      sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}
                    >
                      <TextField
                        fullWidth
                        label={labels.paymentValue}
                        type="number"
                        value={receipt.paymentValue}
                        onChange={(e) =>
                          handleUpdateReceiptState(
                            "paymentValue",
                            e.target.value
                          )
                        }
                        onBlur={(e) =>
                          validateMultiple(parseFloat(e.target.value))
                        }
                        inputProps={{
                          inputMode: "decimal",
                          style: {
                            paddingLeft: theme.spacing(0),
                            marginLeft: theme.spacing(-2),
                            paddingRight: theme.spacing(0.5),
                            textAlign: "center",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              $&nbsp;
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    {/* Día de pago */}
                    <Grid item xs={12} md={7} sx={{ px: 0 }}>
                      <PickDateSection
                        title={labels.paymentDay}
                        deliveryDate={payReceipt.paymentDay}
                        updateDateDetails={handleUpdateReceiptState}
                        updateDateKey="paymentDay"
                        sx={{ mb: 0, width: "100%" }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Comentario */}
              <Grid container>
                <Grid item xs={0} md={2} />
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label={labels.comments}
                    value={receipt.comments}
                    onChange={(e) =>
                      handleUpdateReceiptState("comments", e.target.value)
                    }
                  />
                </Grid>
              </Grid>

              {/* Evidencia */}
              <Grid container>
                <Grid item xs={0} md={2} />
                <Grid item xs={12} md={10}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      mt: { xs: 0, md: 2 },
                      ml: { xs: 0, md: 6 },
                      fontWeight: theme.typography.fontWeightRegular,
                    }}
                  >
                    {labels.evidenceFile}
                  </Typography>
                </Grid>
                <Grid item xs={0} md={2} />
                <Grid item xs={12} md={8} sx={{ mt: 2 }}>
                  <DragDropFiles
                    filesVar={files}
                    setFilesVar={setFiles}
                    acceptFiles={["image/*", "application/pdf"]}
                    selectFilesMsg="Arrastra y suelta archivos aquí o haz click para seleccionar archivos."
                    multiple={false}
                    sx={{ mx: { xs: 1, md: 10 } }}
                  />
                </Grid>
              </Grid>

              {/* Agregar Complemento de pago */}
              {/* Validar ppd */}
              <Grid container>
                <Grid item xs={0} md={3} />
                <Grid item xs={12} md={6} sx={{ px: 1 }}>
                  <Grid container>
                    <Grid item xs={3} md={2} sx={{ textAlign: "center" }}>
                      <Checkbox
                        checked={complementCheck}
                        onChange={handleComplementCheckChange}
                        color="primary"
                      />
                    </Grid>
                    <Grid item xs={9} md={10}>
                      <Typography
                        variant="subtitle1"
                        color={"text.secondary"}
                        sx={{
                          mt: theme.spacing(1),
                          fontWeight: theme.typography.fontWeightLight,
                        }}
                      >
                        Añadir complemento de pago
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Ordenes */}
              <Grid container>
                <Grid item xs={0} md={2} />
                <Grid item xs={12} md={10}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      mt: { xs: 0, md: 2 },
                      ml: { xs: 0, md: 6 },
                      fontWeight: theme.typography.fontWeightRegular,
                    }}
                  >
                    {labels.ordenes}
                  </Typography>
                </Grid>
                <Grid item xs={0} md={4} />
                <Grid item xs={12} md={6} sx={{ mt: 1 }}>
                  {payReceipt?.ordenes &&
                    payReceipt?.ordenes?.map(
                      (orden: PaymentReceiptOrdenType, j: number) => (
                        <Chip
                          key={j}
                          label={`Orden ID: ${orden.ordenId}`}
                          color="info"
                          sx={{ mb: 1 }}
                        />
                      )
                    )}
                  {!payReceipt?.ordenes && (
                    <Typography color="text.secondary" align="center">
                      No hay pedidos asociados.
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Errors */}
              {errors.length > 0 && (
                <Grid container>
                  <Grid item xs={0} md={3} />
                  <Grid item xs={12} md={7}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.map((err, i) => (
                        <Typography key={i}>{err.value}</Typography>
                      ))}
                    </Alert>
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ mr: 2, my: 1 }}
          onClick={() => onClose(false)}
          color="info"
        >
          Cerrar
        </Button>

        <LoadingButton
          sx={{ mr: 2, my: 1 }}
          onClick={handleUploadPayment}
          color="primary"
          variant="contained"
          disabled={errors.length > 0 || !formFull}
          loading={loading}
        >
          Guardar Comprobante
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentReceiptFormModal;
