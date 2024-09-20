import { useEffect, useState } from "react";

import { Alert, Box, Checkbox, Grid, TextField, Typography, useTheme } from "@mui/material";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";

// redux
import {
  clearNewOrden,
  resetCurrentStep,
  setNewOrdenClient,
  submitConsolidatedOrdenPayment,
  updateNewOrden,
} from "../../../redux/slices/orden";
import {
  clearClientToOrden,
  getActiveClients,
} from "../../../redux/slices/client";
// utils
import PickClientSection from "../../../components/orden/PickClient";
import { LoadingButton } from "@mui/lab";
import { InvoiceType, OrdenType } from "../../../domain/orden/Orden";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { PATH_APP } from "../../../routes/paths";
import { computeOrdersTotals, sumValuesInList} from "../../../utils/helpers";
import PickPaymentToOrdersSection from "../../../components/orden/PickOrdersToPayment";
import PickDateSection from "../../../components/orden/PickDate";
import DragDropFiles from "../../../components/DragDropFiles";

// ----------------------------------------------------------------------
interface ConsolidatedOrdersMap {
  [key: string]: number;
}

const ListPaymentsOrdenesView: React.FC<{}> = () => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const editMode: boolean | undefined = false;
  const { activeOrdenes } = useAppSelector(
    (state) => state.orden
  );
  const { activeUnit } = useAppSelector((state) => state.account);
  const { activeClients, clientToOrden } = useAppSelector(
    (state) => state.client
  );
  const dispatch = useAppDispatch();
  const { newOrden } = useAppSelector((state) => state.orden);
  const [selectedConsolidatedOrders, setSelectedConsolidatedOrders] = useState<
    (OrdenType & { invoice?: InvoiceType } & { paymentAmount?: string | number })[]
  >([]);
  const [selectedConsolidatedOrdersMap, setSelectedConsolidatedOrdersMap] = useState<
    ConsolidatedOrdersMap
  >({});
  const [consolidatedTotal, setConsolidatedTotal] = useState<
    number | undefined
  >(undefined);
  const [paymentValueTotal, setPaymentValueTotal] = useState<
    number | undefined
  >(undefined);
  const [files, setFiles] = useState<FileList | null>(null); // files to upload
  const [paymentDay, setPaymentDay] = useState<
    Date | undefined
  >(new Date());
  const [comment, setComment] = useState<
    string | undefined
  >(undefined);
  const [complementCheck, setComplementCheck] = useState(false);
  const [issudmitted, setIssudmitted] = useState<
    boolean
  >(false);
  const [paymentMethodValidation, setPaymentMethodValidation] = useState<
    boolean
  >(false);
  const [invoiceTypeValidation, setInvoiceTypeValidation] = useState<
    boolean
  >(false);
  const labels: { [key: string]: string } = {
    paymentValue: "Monto del Pago",
    evidenceFile: "Evidencia (opcional)",
    paymentDay: "Fecha de pago (opcional)",
    comments: "Comentarios (opcional)",
    ordenes: "Pedidos asociados:",
  };

  // set client
  useEffect(() => {
    const uniquePagos: (string | undefined)[] = Array.from(new Set(selectedConsolidatedOrders.map(order => order.paymentMethod)));
    if (uniquePagos.length > 1) {
      setPaymentMethodValidation(false)
    }
    else {
      setPaymentMethodValidation(true)
    }
    const invoiceTypes: (string | undefined)[] = Array.from(new Set(selectedConsolidatedOrders.map(order => order.invoice?.invoiceType)));
    const ordersWithInvoice = selectedConsolidatedOrders.filter(order => order.invoice?.invoiceType);
    const hasPUE: boolean = invoiceTypes.includes("PUE");
    if (invoiceTypes.length > 1 || ordersWithInvoice.length !== selectedConsolidatedOrders.length || hasPUE || selectedConsolidatedOrders.length === 0) {
      setInvoiceTypeValidation(false)
    }
    else {
      setInvoiceTypeValidation(true)
    }
  }, [dispatch, selectedConsolidatedOrders, consolidatedTotal]);

  // set client
  useEffect(() => {
    if (clientToOrden.branchName) {
      dispatch(setNewOrdenClient(clientToOrden));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clientToOrden]);

  // on Mount
  useEffect(() => {
    if (!sessionToken) return;
    if (!activeUnit) return;
    // fetch active clientes for each unit
    dispatch(getActiveClients([activeUnit.id], sessionToken));
    // update the active client in order too
    dispatch(
      updateNewOrden({
        key: "supplier",
        value: activeUnit,
      })
    );
    dispatch(setNewOrdenClient({}));
    // destructor method -> calls this to clear when component unmounts
    return () => {
      dispatch(resetCurrentStep());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken, activeUnit]);

  const updateSelectedOrdersMap = (orden_id: string, numericValue: number) => {
    setSelectedConsolidatedOrdersMap((prevMap) => {
      if (orden_id in prevMap) {
        // Update the existing value
        return { ...prevMap, [orden_id]: numericValue };
      } else {
        // Add a new entry
        return { ...prevMap, [orden_id]: numericValue };
      }
    });
  };


  const selectOrderReceiptState = (orden: (OrdenType & { paymentAmount?: string | number })) => {
    if (!orden.id) return;
    let numericValue: number;
    if (typeof (orden.paymentAmount) === 'string') {
      numericValue = parseFloat(orden.paymentAmount);
      if (isNaN(numericValue)) {
        // Alert if conversion is not possible
        if (orden.paymentAmount === '') { numericValue = 0 }
        else {
          enqueueSnackbar("El monto debe ser un número", {
            variant: "error",
          });
          numericValue = 0
        }
      }
      else {
        if (numericValue < 0) {

          enqueueSnackbar("El monto debe ser un número positivo", {
            variant: "error",
          });

          numericValue = 0
        }
      }

    }
    else {
      if (typeof (orden.paymentAmount) === 'number' && orden.paymentAmount > 0) { numericValue = orden.paymentAmount }
      else {

        enqueueSnackbar("El monto debe ser un número positivo", {
          variant: "error",
        });

        numericValue = 0
      }
    };
    const consoliIndex = selectedConsolidatedOrders.findIndex(
      (sOrden) => sOrden.id === orden.id
    );
    if (consoliIndex !== -1) {
      if (numericValue > 0) {
        selectedConsolidatedOrders[consoliIndex].paymentAmount = numericValue;
        setSelectedConsolidatedOrders(selectedConsolidatedOrders);
        const _subt = computeOrdersTotals(selectedConsolidatedOrders);
        setConsolidatedTotal(_subt.total);
        const totalPaymentAmount: number = sumValuesInList(selectedConsolidatedOrders)
        setPaymentValueTotal(totalPaymentAmount)
        updateSelectedOrdersMap(orden.id, numericValue);
      }
      else {
        const filterSelectedConsolidatedOrders = selectedConsolidatedOrders.filter((item) => item.id !== orden.id)
        setSelectedConsolidatedOrders(filterSelectedConsolidatedOrders);
        const _subt = computeOrdersTotals(filterSelectedConsolidatedOrders);
        setConsolidatedTotal(_subt.total);
        const totalPaymentAmount: number = sumValuesInList(filterSelectedConsolidatedOrders)
        setPaymentValueTotal(totalPaymentAmount)
        updateSelectedOrdersMap(orden.id, numericValue);
      }
    } else {
      if (numericValue > 0) {
        selectedConsolidatedOrders.push({ ...orden, paymentAmount: numericValue });
        setSelectedConsolidatedOrders(selectedConsolidatedOrders);
        const _subt = computeOrdersTotals(selectedConsolidatedOrders);
        setConsolidatedTotal(_subt.total);
        const totalPaymentAmount: number = sumValuesInList(selectedConsolidatedOrders)
        setPaymentValueTotal(totalPaymentAmount)
        updateSelectedOrdersMap(orden.id, numericValue);
      }
    }
  };


  const handleSendConsolidate = async () => {
    setIssudmitted(true)
    const ordenIds = selectedConsolidatedOrders
      .map((o: OrdenType) => o.id)
      .filter((item) => item !== undefined);
      const ordenAmounts: { ordenId: string; amount: number }[] = selectedConsolidatedOrders
      .filter(order => 
        order.id !== undefined &&
        typeof order.paymentAmount === 'number' && 
        order.paymentAmount >= 0 
      )
      .map(order => {
        // Extract relevant information from each order
        const ordenId = order.id as string; // ordenId can be undefined now
        const amount = order.paymentAmount as number; // Assuming paymentAmount is already checked to be a number
    
        // Return the new object
        return { ordenId, amount };
      });
    try {
      // TOTO HOY CAMBIAR invoice por payment
      await dispatch(
        submitConsolidatedOrdenPayment(
          sessionToken || "",
          ordenAmounts,
          paymentDay || undefined, // provide a default value of current date if paymentDay is undefined,
          comment || "",
          files?.item(0) || undefined,
          complementCheck
        )
      );
      enqueueSnackbar("Pago creadao correctamente", {
        variant: "success",
      });
      setIssudmitted(false)

      if (ordenIds[0] !== undefined) {
        navigate(PATH_APP.orden.details.replace(":ordenId", ordenIds[0]));
      }

    } catch (error: any) {
      console.log(error);
      setIssudmitted(false)
      enqueueSnackbar("Error al crear la pago", {
        variant: "error",
      });
      return;
    }
    dispatch(clearNewOrden());
    dispatch(clearClientToOrden());
  };

  const handleComplementCheckChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setComplementCheck(event.target.checked);
  };

  const handleUpdateReceiptState = (key: string, value: any) => {
    if (key === "paymentDay") {
      try {
        setPaymentDay(value)
      }
      catch (error) {
        enqueueSnackbar("El monto tiene que ser un numero", {
          variant: "error",
        });
      }
    }
    if (key === "comment") {
      setComment(value)
    }
  };

  return (
    <Box>
      {/* Step 1: Select Client */}
      {/* [TODO] @Fer Cambiar NewOrden por NewInvoice, es muy parecido o un Use Effect*/}
      <PickClientSection
        sx={{ mb: theme.spacing(2) }}
        pickedClient={newOrden.restaurantBranch}
        clients={activeClients}
        disabled={editMode}
        variant="multiselect"
      />
      {(!activeClients || activeClients.length === 0) && (
        <Alert severity="warning" sx={{ mb: theme.spacing(2) }}>
          Éste CEDIS no tiene clientes disponibles.
        </Alert>
      )}

      {newOrden.restaurantBranch.id && (
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 } }}
          >
            <TextField
              fullWidth
              label={labels.comments}
              onChange={(e) =>
                handleUpdateReceiptState("comment", e.target.value)
              }
            />
          </Grid>
          {/* Día de pago */}
          <Grid item xs={12} md={6} sx={{ px: 0 }}>
            <PickDateSection
              title={labels.paymentDay}
              deliveryDate={new Date()}
              updateDateDetails={handleUpdateReceiptState}
              updateDateKey="paymentDay"
              sx={{ mb: 0, width: "100%" }}
            />
          </Grid>
        </Grid>
      )}

      {newOrden.restaurantBranch.id && (
        <PickPaymentToOrdersSection
          orders={activeOrdenes}
          handleUpdateReceiptState={selectOrderReceiptState}
          selectedConsolidatedOrdersMap={selectedConsolidatedOrdersMap}
          setSelectedConsolidatedOrders={setSelectedConsolidatedOrders}
          setConsolidatedTotal={setConsolidatedTotal}
          consolidatedTotal={consolidatedTotal}
          setPaymentValueTotal={setPaymentValueTotal}
          paymentValueTotal={paymentValueTotal}
          setSelectedConsolidatedOrdersMap={setSelectedConsolidatedOrdersMap}
        />
      )}
      {/* Evidencia */}
      {newOrden.restaurantBranch.id && (
        <Grid container mb={2}>
          <Grid item xs={12} md={12}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mt: { xs: 1, md: 2 },
                mb: { xs: 0.5, md: 1 },
              }}
            >
              {labels.evidenceFile}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12} sx={{ mt: 1 }}>
            <DragDropFiles
              filesVar={files}
              setFilesVar={setFiles}
              acceptFiles={["image/*", "application/pdf"]}
              selectFilesMsg="Arrastra y suelta archivos aquí o haz click para seleccionar archivos."
              multiple={false}
            />
          </Grid>
        </Grid>)}

      {/* Agregar Complemento de pago */}
      {newOrden.restaurantBranch.id && invoiceTypeValidation && (
        <Grid container>
          <Grid item xs={0} md={3} mt={1} />
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
                  variant="h6"
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
      )}


      {/* submit */}
      {
        <LoadingButton
          fullWidth
          disabled={
            selectedConsolidatedOrders.length === 0 ||
            paymentDay === undefined ||
            !paymentMethodValidation
          }
          size="large"
          type="submit"
          variant="contained"
          loading={issudmitted}
          onClick={handleSendConsolidate}
          style={{ marginTop: '20px' }}
        >
          {`Crear Pago Consolidado`}
        </LoadingButton>
      }
      {/* helper msg */}
      {selectedConsolidatedOrders.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
          <i>{selectedConsolidatedOrders.length} Pedidos Seleccionado(s)</i>
        </Typography>
      ) : null}

      {selectedConsolidatedOrders.length > 0 && !paymentMethodValidation && (
        <Alert severity="warning" sx={{ mb: theme.spacing(2) }}>
          Las ordenes seleccionadas tienen diferentes tipos de pago.
        </Alert>
      )}
    </Box>
  );
};

export default ListPaymentsOrdenesView;
