import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { enqueueSnackbar } from "notistack";
// material
import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Grid, Typography, useTheme } from "@mui/material";
// hook
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useAuth from "../../../hooks/useAuth";
// routes
import { PATH_APP } from "../../../routes/paths";
// redux
import {
  clearNewOrden,
  clearOrdenSubmitted,
  getClientCatalog,
  initializeCart,
  nextCurrentStep,
  previousCurrentStep,
  resetCurrentStep,
  setNewOrdenClient,
  submitNewOrdenNormal,
  submitUpdateOrden,
  updateNewOrden,
  updateProductQuantity,
} from "../../../redux/slices/orden";
import {
  clearClientToOrden,
  getActiveClients,
  getClientProfileToOrden,
} from "../../../redux/slices/client";
// styles
// components
import PickDeliveryDateSection from "../../../components/orden/PickDeliveryDate";
import PickPaymentMethodSection from "../../../components/orden/PickPaymentMethod";
import OrdenSummary from "../../../components/orden/OrdenSummary";
import PickClientSection from "../../../components/orden/PickClient";
import PickSupplierProductsSection from "../../../components/orden/PickSupplierProducts";
import BasicDialog from "../../../components/navigation/BasicDialog";
// domain
import { CartProductType } from "../../../domain/orden/Orden";
// utils
import { NEW_ORDEN_STEPS } from ".";
import { delay, fISODate, isMinimumQtyReached } from "../../../utils/helpers";
import { mixtrack } from "../../../utils/analytics";
import { DeliveryType } from "../../../domain/supplier/SupplierProduct";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type OrdenPickupViewProps = {
  clientId?: string;
  editMode?: boolean;
  viewMode: "orden" | "reInvoice";
};

const OrdenPickupView: React.FC<OrdenPickupViewProps> = ({
  clientId,
  editMode = false,
  viewMode = "orden",
}) => {
  const theme = useTheme();
  const { sessionToken } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  // redux
  const { activeClients, clientToOrden } = useAppSelector(
    (state) => state.client
  );
  const { newOrdenCurrentStep, newOrden, supplierProducts, ordenSubmitted } =
    useAppSelector((state) => state.orden);
  const { activeUnit, business } = useAppSelector((state) => state.account);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [changeMaxQuantity, setChangeMaxQuantity] = useState<string|undefined>(undefined);

  // on Mount
  useEffect(() => {
    if (!sessionToken) return;
    if (!activeUnit) return;
    // fetch active clientes for each unit
    dispatch(getActiveClients([activeUnit.id], sessionToken));
    dispatch(
      updateNewOrden({
        key: "supplier",
        value: activeUnit,
      })
    );
    // set default values
    if (!editMode) {
      // [TODO] - later implement cart backend sync
      dispatch(
        initializeCart({
          id: undefined,
          cartProducts: [],
        })
      );
      if (!clientId) {
        dispatch(setNewOrdenClient({}));
      }
    }
    return () => {
      dispatch(resetCurrentStep());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, sessionToken, activeUnit]);

  useEffect(() => {
    if (clientToOrden?.fullAddress) {
      // set default delivery address
      dispatch(
        updateNewOrden({
          key: "deliveryAddress",
          value: clientToOrden.fullAddress,
        })
      );
      // set restaurant branch
      if (editMode) {
        dispatch(
          updateNewOrden({
            key: "restaurantBranch",
            value: clientToOrden,
          })
        );
        // add all products to cart with 0 quantity
        if (newOrden.cart) {
          const newCartProds = clientToOrden.products.map((p: any) => {
            const cartProd = newOrden.cart.cartProducts.find(
              (cp: any) => cp.id === p.id
            );
            let prod = { ...p }
            if (editMode) {
              const stockEnabled = p.stock
                ? p.stock.active &&
                !p.stock.keepSellingWithoutStock
                : false;
              if (stockEnabled) {
                const unitMultiple = p.unitMultiple || 1;
                const quantity = cartProd?.quantity || 0
                const editAmount = p.stock.amount + quantity * unitMultiple;
                const editStock = {
                  ...p.stock,
                  amount: editAmount
                };
                prod = { ...p, stock: editStock }
              }
            }
            return {
              id: p.id,
              price: p.price,
              quantity: cartProd?.quantity || 0,
              supplierProduct: prod,
              total: cartProd?.total || 0,
            };
          });
          dispatch(
            updateNewOrden({
              key: "cart",
              value: {
                ...newOrden.cart,
                cartProducts: newCartProds,
              },
            })
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clientToOrden]);

  // fetch products
  useEffect(() => {
    if (newOrden.restaurantBranch.id && newOrden.restaurantBranch.id !== "") {
      dispatch(getClientCatalog(newOrden.restaurantBranch));
    } else if (!editMode) {
      dispatch(
        initializeCart({
          id: undefined,
          cartProducts: [],
        })
      );
      dispatch(resetCurrentStep());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, newOrden.restaurantBranch]);

  // update orden cart
  useEffect(() => {
    if (supplierProducts.length > 0 && !editMode) {
      dispatch(
        initializeCart({
          id: newOrden.cart.id,
          cartProducts: supplierProducts.map((p: CartProductType) => ({
            ...p,
            quantity: 0,
          })),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, supplierProducts]);

  // fetch client profile
  useEffect(() => {
    if (clientId && activeUnit && sessionToken) {
      dispatch(getClientProfileToOrden(activeUnit.id, clientId, sessionToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clientId, sessionToken, activeUnit]);

  // set client
  useEffect(() => {
    if (clientToOrden.branchName) {
      dispatch(setNewOrdenClient(clientToOrden));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clientToOrden]);

  // Step handlers
  const handleNextStep = async () => {
    if (newOrdenCurrentStep < NEW_ORDEN_STEPS.length - 1) {
      dispatch(nextCurrentStep());
      mixtrack("add_orden_steps", {
        step: newOrdenCurrentStep,
        visit: window.location.toString(),
        page: "Orden",
        section: "",
      });
    } else {
      // is submitting
      setIsSubmitting(true);
      if (editMode && !pathname.includes("validate")) {
        try {
          await dispatch(
            submitUpdateOrden(
              newOrden.id,
              newOrden.cart.cartProducts.filter((p: any) => p.quantity > 0),
              newOrden.deliveryDate,
              newOrden.deliveryTime,
              newOrden.comments,
              newOrden.paymentMethod,
              sessionToken || "",
              "pickup" as DeliveryType
            )
          );
          enqueueSnackbar("Pedido actualizado correctamente", {
            variant: "success",
          });
          mixtrack("orden", {
            transactionType: "update",
            orderId: newOrden.id,
            visit: window.location.toString(),
            page: "Orden",
            section: "",
          });
          navigate(PATH_APP.orden.details.replace(":ordenId", newOrden.id));
          dispatch(clearOrdenSubmitted());
          await delay(1000);
        } catch (error: any) {
          console.log(error);
          enqueueSnackbar("Error al actualizar el pedido", {
            variant: "error",
          });
          setIsSubmitting(false);
          mixtrack("error", {
            error: error.toString(),
            transactionType: "update",
            visit: window.location.toString(),
            page: "Orden",
            section: "",
          });
          return;
        }
      } else {
        try {
          await dispatch(
            submitNewOrdenNormal(
              business.id,
              {
                ...newOrden,
                cart: {
                  id: newOrden.cart.id,
                  cartProducts: newOrden.cart.cartProducts.filter(
                    (p: any) => p.quantity > 0
                  ),
                },
                deliveryDate: fISODate(newOrden.deliveryDate),
                deliveryType: "pickup" as DeliveryType,
              },
              sessionToken || ""
            )
          );
          enqueueSnackbar("Pedido enviado correctamente", {
            variant: "success",
          });
          mixtrack("orden", {
            transactionType: "create",
            visit: window.location.toString(),
            page: "Orden",
            section: "",
          });
          setModalOpen(true);
          await delay(1000);
        } catch (error: any) {
          console.log(error);
          enqueueSnackbar("Error al enviar el pedido", {
            variant: "error",
          });
          setIsSubmitting(false);
          mixtrack("error", {
            error: error.toString(),
            transactionType: "create",
            visit: window.location.toString(),
            page: "Orden",
            section: "",
          });
          return;
        }
      }
      dispatch(resetCurrentStep());
      dispatch(clearNewOrden());
      dispatch(clearClientToOrden());
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = () => {
    if (newOrdenCurrentStep > 0) {
      dispatch(previousCurrentStep());
    }
  };

  // Cart handlers
  const dispatchProductQuantity = (product: CartProductType, qty: number) => {
    dispatch(
      updateProductQuantity({
        ...product,
        quantity: qty,
      })
    );
  };

  const deleteFromCart = (product: CartProductType) => {
    dispatchProductQuantity(product, 0);
  };

  function roundDownToNearestMultiple(num: number, multiple: number): number {
    return Math.floor(num / multiple) * multiple;
  }

  const decreaseQtyFromCart = (product: CartProductType) => {
    const unitMultiple = product.supplierProduct.unitMultiple || 1;
    const minimumQuantity = product.supplierProduct.minimumQuantity || 1;
    const maxQty = product.quantity === minimumQuantity*(1/unitMultiple) ? minimumQuantity*(1/unitMultiple) : 1;
    const qtyToRem = product.quantity - maxQty;
    dispatchProductQuantity(product, qtyToRem);
  };

  const increaseQtyFromCart = (product: CartProductType,) => {
    const stockEnabled = product.supplierProduct.stock
      ? product.supplierProduct.stock.active &&
      !product.supplierProduct.stock.keepSellingWithoutStock
      : false;
    const stockAmount = product.supplierProduct.stock?.amount || 0;
    const hasStock = stockAmount > 0;
    const unitMultiple = product.supplierProduct.unitMultiple || 1;
    const minimumQuantity = product.supplierProduct.minimumQuantity || 1;
    const minQty = product.quantity > 0 ? 1 : minimumQuantity*(1/unitMultiple);
    const qtyToAdd = product.quantity + minQty;

    if (!stockEnabled) {
      dispatchProductQuantity(product, qtyToAdd);
    }
    else {
      
      if (!hasStock) {
        // show alert("No hay stock disponible");
        enqueueSnackbar(`No hay más inventario disponible de ${product.supplierProduct.productDescription}`, {
          variant: "warning",
        });
        setChangeMaxQuantity(product.supplierProduct.id);
        return; 
      }
      const reachedStockOut = qtyToAdd*unitMultiple >= stockAmount;
      if (!reachedStockOut) {
        dispatchProductQuantity(product, qtyToAdd);
      } else {
        // show alert("No hay stock suficiente");
        enqueueSnackbar(`No hay más inventario disponible de ${product.supplierProduct.productDescription}`, {
          variant: "warning",
        });
        if (stockAmount >= minimumQuantity) {
          // get last multiple of unitMultiple after stockAmount
          const lastMultiple = roundDownToNearestMultiple(stockAmount, unitMultiple);
          dispatchProductQuantity(product, lastMultiple*(1/unitMultiple));
          setChangeMaxQuantity(product.supplierProduct.id);
        } else {
          dispatchProductQuantity(product, 0);
          setChangeMaxQuantity(product.supplierProduct.id);
        }
      }
    }
  };

  function convertToNumber(value: string | number): number {
    if (typeof value === 'string') {
      const result = parseFloat(value);
      if (isNaN(result)) {
        return 0;
      }
      return result;
    } else if (typeof value === 'number') {
      return value;
    } else {
      throw new Error('Value must be a string or a number');
    }
  }

  const changeQtyFromCart = (product: CartProductType, value: string | number) => {
    const numberValue = convertToNumber(value);
    const unitMultiple = product.supplierProduct.unitMultiple || 1;
    const minimumQuantity = product.supplierProduct.minimumQuantity || 1;
    const stockEnabled = product.supplierProduct.stock
      ? product.supplierProduct.stock.active &&
      !product.supplierProduct.stock.keepSellingWithoutStock
      : false;
    const stockAmount = product.supplierProduct.stock?.amount || 0;
    const hasStock = stockAmount > 0;
    if (!stockEnabled) {
      dispatchProductQuantity(product, numberValue);
    }
    else {
      if (!hasStock) {
        // show alert("No hay stock disponible");
        enqueueSnackbar(`No hay más inventario disponible de ${product.supplierProduct.productDescription}`, {
          variant: "warning",
        });
        setChangeMaxQuantity(product.supplierProduct.id);
        return;
      }
      const qtyToAdd = numberValue;
      const reachedStockOut = qtyToAdd >= stockAmount * (1 / unitMultiple);
      if (!reachedStockOut) {
        dispatchProductQuantity(product, numberValue);
      } else {
        // show alert("No hay stock suficiente");
        enqueueSnackbar(`No hay más inventario disponible de ${product.supplierProduct.productDescription}`, {
          variant: "warning",
        });
        if (stockAmount >= minimumQuantity) {
          const lastMultiple = roundDownToNearestMultiple(stockAmount, unitMultiple);
          dispatchProductQuantity(product, lastMultiple*(1/unitMultiple));
          setChangeMaxQuantity(product.supplierProduct.id);
        } else {
          dispatchProductQuantity(product, 0);
          setChangeMaxQuantity(product.supplierProduct.id);
        }
      }
    }
  };

  // Delivery handlers
  const updateDeliveryDetails = (deliveryDetail: string, value: any) => {
    dispatch(updateNewOrden({ key: deliveryDetail, value: value }));
  };

  // compute minimum quantity reached or not
  const ordenPassedMin = isMinimumQtyReached(
    newOrden.cart.cartProducts,
    business.minQuantity,
    business.minQuantityUnit
  );

  // Continue flags
  const canContinue =
    (newOrdenCurrentStep === 0 &&
      newOrden.restaurantBranch?.id &&
      newOrden.restaurantBranch?.id !== "" &&
      newOrden.cart.cartProducts.filter((p: any) => p.quantity > 0).length >
        0) ||
    (newOrdenCurrentStep === 1 &&
      newOrden.deliveryDate !== undefined &&
      newOrden.deliveryAddress !== undefined &&
      newOrden.deliveryTime !== undefined) ||
    (newOrdenCurrentStep === 2 && newOrden.paymentMethod !== undefined);
  const btnMessage =
    newOrdenCurrentStep < NEW_ORDEN_STEPS.length - 1
      ? "Continuar"
      : viewMode === "reInvoice"
      ? "Refacturar"
      : editMode && !pathname.includes("validate")
      ? "Actualizar Pedido"
      : "Enviar Pedido";

  // render method
  return (
    <Box sx={{ mt: theme.spacing(2) }}>
      <BasicDialog
        open={modalOpen || ordenSubmitted?.id !== undefined}
        onClose={() => setModalOpen(false)}
        closeMark={false}
        title={"Pedido enviado correctamente"}
        continueAction={{
          active: true,
          msg: "Ver detalle",
          actionFn: () => {
            setModalOpen(false);
            dispatch(clearOrdenSubmitted());
            navigate(
              PATH_APP.orden.details.replace(":ordenId", ordenSubmitted?.id)
            );
          },
        }}
        backAction={{
          active: true,
          msg: "Ir a Pedidos",
          actionFn: () => {
            setModalOpen(false);
            dispatch(clearOrdenSubmitted());
            navigate(PATH_APP.orden.list);
          },
        }}
      >
        <Typography variant="body2" sx={{ mt: theme.spacing(2) }}>
          Tu pedido fue enviado, y se creó con el <br />
          <b>ID #{(ordenSubmitted?.id || "").slice(0, 10)}</b>.
        </Typography>
        <Typography variant="body2" sx={{ mt: theme.spacing(2) }}>
          ¿Desea ver el detalle del pedido?
        </Typography>
      </BasicDialog>
      {/* Step 1 */}
      {newOrdenCurrentStep === 0 && (
        <Box>
          {/* Step 1: Select Client */}
          <PickClientSection
            sx={{ mb: theme.spacing(2) }}
            pickedClient={newOrden.restaurantBranch}
            clients={activeClients}
            disabled={editMode}
            variant="multiselect"
          />
          {newOrden.restaurantBranch.id &&
            (!newOrden.restaurantBranch?.products ||
              newOrden.restaurantBranch?.products?.length < 1) && (
              <Alert severity="warning" sx={{ mb: theme.spacing(2) }}>
                Éste CEDIS no tiene productos disponibles para este cliente.
                Revisa tu lista de precios.
              </Alert>
            )}
          {/* Step 1: Select products */}
          {newOrden.restaurantBranch.id && (
            <PickSupplierProductsSection
              products={newOrden.cart.cartProducts}
              onDelete={deleteFromCart}
              onDecreaseQuantity={decreaseQtyFromCart}
              onIncreaseQuantity={increaseQtyFromCart}
              minReached={ordenPassedMin}
              sortValsDefault={editMode}
              onChangeQuantity={changeQtyFromCart}
              changeMaxQuantity={changeMaxQuantity}
              setChangeMaxQuantity={setChangeMaxQuantity}
            />
          )}
        </Box>
      )}

      {/* Step 2 */}
      {newOrdenCurrentStep === 1 && (
        <Box>
          {/* Step 2: Select delivery date */}
          <PickDeliveryDateSection
            pickedUnit={activeUnit}
            deliveryDate={newOrden.deliveryDate}
            comments={newOrden.comments || ""}
            deliveryTime={newOrden.deliveryTime || ""}
            withDeliveryTime={true}
            updateDeliveryDetails={updateDeliveryDetails}
            editMode={editMode}
            sx={{ mb: theme.spacing(3) }}
          />
        </Box>
      )}

      {/* Step: 3 */}
      {newOrdenCurrentStep === 2 && (
        <Box>
          {/* Step 3: Confirm order */}
          <PickPaymentMethodSection
            supUnit={activeUnit}
            paymentMethod={newOrden.paymentMethod}
            updatePaymentMethod={updateDeliveryDetails}
          />
          {/* Step 3: Summary of the order */}
          <OrdenSummary
            orden={newOrden}
            sx={{ mt: theme.spacing(3), mx: theme.spacing(2) }}
          />
        </Box>
      )}

      {/* Actions */}
      <Grid
        container
        spacing={0}
        direction={"row"}
        sx={{ my: theme.spacing(3) }}
      >
        {newOrdenCurrentStep !== 0 && (
          <Grid item xs={6} md={6} sx={{ px: theme.spacing(0.5) }}>
            <Button
              fullWidth
              variant="contained"
              color="info"
              onClick={handlePreviousStep}
            >
              Regresar
            </Button>
          </Grid>
        )}
        <Grid
          item
          xs={newOrdenCurrentStep === 0 ? 12 : 6}
          md={newOrdenCurrentStep === 0 ? 12 : 6}
          sx={{ px: theme.spacing(0.5) }}
        >
          {newOrden.restaurantBranch.id && (
            <LoadingButton
              fullWidth
              disabled={!canContinue}
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={handleNextStep}
            >
              {btnMessage}
            </LoadingButton>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrdenPickupView;
