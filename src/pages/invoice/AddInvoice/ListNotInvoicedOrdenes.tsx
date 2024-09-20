import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Alert, Box, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router";
// redux
import {
  clearNewOrden,
  resetCurrentStep,
  setNewOrdenClient,
  submitConsolidatedInvoice,
  updateNewOrden,
} from "../../../redux/slices/orden";
import {
  clearClientToOrden,
  getActiveClients,
} from "../../../redux/slices/client";
// utils
import PickClientSection from "../../../components/orden/PickClient";
import PickOrdersSection from "../../../components/orden/PickOrdens";
import PickPaymentMethodSection from "../../../components/orden/PickPaymentMethod";
import { OrdenType } from "../../../domain/orden/Orden";
import { PATH_APP } from "../../../routes/paths";
import { computeOrdersTotals } from "../../../utils/helpers";

// ----------------------------------------------------------------------

const ListNotInvoicedOrdenesView: React.FC<{}> = () => {
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
    OrdenType[]
  >([]);
  const [consolidatedTotal, setConsolidatedTotal] = useState<
    number | undefined
  >(undefined);
  const [isSubmitted, setIsSubmitted] = useState<
    boolean
  >(false);

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

  // Delivery handlers
  const updateDeliveryDetails = (deliveryDetail: string, value: any) => {
    dispatch(updateNewOrden({ key: deliveryDetail, value: value }));
  };

  const handleCheckboxChange = (orden: OrdenType) => {
    const index = selectedConsolidatedOrders.findIndex(
      (sOrden) => sOrden.id === orden.id
    );
    if (index !== -1) {
      selectedConsolidatedOrders.splice(index, 1);
    } else {
      selectedConsolidatedOrders.push(orden);
    }
    setSelectedConsolidatedOrders(selectedConsolidatedOrders);
    const _subt = computeOrdersTotals(selectedConsolidatedOrders);
    setConsolidatedTotal(_subt.total);
  };

  const handleSendConsolidate = async () => {
    setIsSubmitted(true)
    const ordenIds = selectedConsolidatedOrders
      .map((o: OrdenType) => o.id)
      .filter((item) => item !== undefined);
    try {
      if (
        !newOrden.paymentMethod &&
        clientToOrden.invoicePaymentMethod === "PUE"
      ) {
        enqueueSnackbar("Selecciona Método de pago", {
          variant: "error",
        });
      } else {
        await dispatch(
          submitConsolidatedInvoice(
            sessionToken || "",
            ordenIds,
            newOrden.paymentMethod || ""
          )
        );
        enqueueSnackbar("Factura Creada correctamente", {
          variant: "success",
        });
        setIsSubmitted(false)

        if (ordenIds[0] !== undefined) {
          navigate(PATH_APP.orden.details.replace(":ordenId", ordenIds[0]));
        }

      }
    } catch (error: any) {
      console.log(error);
      setIsSubmitted(false)
      enqueueSnackbar("Error al crear la factura", {
        variant: "error",
      });
      return;
    }
    dispatch(clearNewOrden());
    dispatch(clearClientToOrden());
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

      {clientToOrden.invoicePaymentMethod && (
        <Alert severity="info" sx={{ mb: theme.spacing(2) }}>
          La facturación para este cliente es{" "}
          {clientToOrden.invoicePaymentMethod}
        </Alert>
      )}

      {clientToOrden.invoicePaymentMethod === "PUE" && (
        <PickPaymentMethodSection
          supUnit={activeUnit}
          paymentMethod={newOrden.paymentMethod}
          updatePaymentMethod={updateDeliveryDetails}
        />
      )}
      {newOrden.restaurantBranch.id && (
        <PickOrdersSection
          orders={activeOrdenes}
          handleCheckboxChange={handleCheckboxChange}
          selectedConsolidatedOrders={selectedConsolidatedOrders}
          setSelectedConsolidatedOrders={setSelectedConsolidatedOrders}
          setConsolidatedTotal={setConsolidatedTotal}
          consolidatedTotal={consolidatedTotal}
        />
      )}

      {/* submit */}
      {
        <LoadingButton
          fullWidth
          disabled={
            selectedConsolidatedOrders.length === 0 ||
            (clientToOrden.invoicePaymentMethod === "PUE" &&
              !newOrden.paymentMethod)
          }
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitted}
          onClick={handleSendConsolidate}
        >
          {`Crear Factura Consolidada`}
        </LoadingButton>
      }
      {/* helper msg */}
      {selectedConsolidatedOrders.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
          <i>{selectedConsolidatedOrders.length} Pedidos Seleccionado(s)</i>
        </Typography>
      ) : null}
    </Box>
  );
};

export default ListNotInvoicedOrdenesView;
