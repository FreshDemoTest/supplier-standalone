// redux
import { createSlice } from "@reduxjs/toolkit";
// domain
import {
  CartProductType,
  CartType,
  ExecutionStatusTypes,
  InvoiceExecutionStatusType,
  InvoiceType,
  OrdenType,
  PayStatusType,
  PaymentReceiptOrdenType,
  PaymentReceiptType,
  ProductValidationType,
  ordenStatusType,
  paymentStatusType,
} from "../../domain/orden/Orden";
import { UnitType } from "../../domain/account/SUnit";
// utils
import {
  computeCartTotals,
  decodeFile,
  fISODate,
  inXTime,
} from "../../utils/helpers";
import { ClientProfileType } from "../../domain/client/Client";
import {
  CANCEL_ORDEN,
  CONFIRM_ORDEN,
  DELIVER_ORDEN,
  EXPORT_HISTORIC_ORDENES,
  GET_ACTIVE_ORDENES_BY_UNIT,
  GET_ORDEN_DETAILS,
  NEW_SUPPLIER_ORDEN,
  REINVOICE_SUPPLIER_ORDEN,
  UPDATE_SUPPLIER_ORDEN,
  UPDATE_SUPPLIER_ORDEN_PAYMENT_METHOD,
} from "../../queries/orden/orden";
import { graphQLFetch, graphQLFetchFiles } from "../../utils/graphql";
import {
  DeliveryType,
  SupplierProductType,
} from "../../domain/supplier/SupplierProduct";
import { GET_CLIENT_PROFILE } from "../../queries/client/client";
import {
  CANCEL_INVOICE,
  EXPORT_INVOICES_BY_RANGE,
  FETCH_INVOICE_EXEC_STATUS,
  FIND_INVOICES_BY_RANGE,
  GET_INVOICES_BY_ORDEN,
  GET_INVOICE_DETAILS,
  GET_MULTIPLE_INVOICES,
  SEND_CONSOLIDATED_INVOICE,
  TRIGGER_GENERATE_INVOICE,
} from "../../queries/orden/invoice";
import {
  ADD_CONSOLIDATED_PAYMENT_RECEIPT,
  ADD_PAYMENT_RECEIPT,
  EDIT_PAYMENT_RECEIPT,
  EXPORT_PAYMENT_DETAILS_BY_DATE,
  GET_PAYMENT_DETAILS_BY_DATE,
  GET_PAYSTATUS_DETAILS,
  UPDATE_PAYSTATUS,
} from "../../queries/payment/payment";

// graphql

// ----------------------------------------------------------------------
const EmptyNewOrden = {
  ordenType: "normal",
  restaurantBranch: {} as ClientProfileType | undefined,
  cart: {
    id: undefined,
    cartProducts: [],
  } as CartType,
  deliveryDate: undefined as Date | undefined,
  deliveryAddress: undefined as string | undefined,
  deliveryTime: undefined as string | undefined,
  paymentMethod: undefined as string | undefined,
  discount: {
    amount: undefined as number | undefined,
    code: "",
  },
  comments: "",
  shippingCost: undefined as number | undefined,
  packagingCost: undefined as number | undefined,
  serviceFee: undefined as number | undefined,
  subtotalWithoutTax: undefined as number | undefined,
  subtotal: undefined as number | undefined,
  tax: undefined as number | undefined,
  total: undefined as number | undefined,
};

const initialState = {
  isLoading: false,
  inProcess: true,
  error: {
    active: false,
    body: "",
  },
  // pagos
  activePagos: [] as Array<InvoiceType>,
  activePagosFilters: {
    search: "",
    status: [],
    dateRange: {
      start: undefined,
      end: undefined,
    },
  },
  // facturas
  activeFacturas: [] as Array<InvoiceType>,
  activeInvoicesOrden: [] as Array<InvoiceType>,
  activeFacturasFilters: {
    search: "",
    status: [],
    client: [],
    dateRange: {
      start: undefined,
      end: undefined,
    },
  },
  // ordenes
  activeOrdenes: [] as Array<OrdenType>,
  activeFilters: {
    search: "",
    dateRange: {
      start: inXTime(1),
      end: inXTime(8),
    },
    status: [],
    paystatus: [],
    client: [],
  },
  exportActiveOrdenes: {
    loaded: false,
    file: undefined as File | undefined,
  },
  exportActiveFacturas: {
    loaded: false,
    file: undefined as File | undefined,
  },
  exportActivePagos: {
    loaded: false,
    file: undefined as File | undefined,
  },
  // orden & invoice details
  ordenDetails: {} as OrdenType | null,
  ordenDetailsNotFound: false,
  invoiceDetails: {} as InvoiceType | null,
  invoiceDetailsNotFound: false,
  invoiceExecStatus: {} as InvoiceExecutionStatusType,
  // paystatus details
  paymentStatusDetails: {} as PayStatusType & {
    receipts?: PaymentReceiptType[];
  },
  // new & edit orden / pre-orden
  supplierProducts: [] as Array<CartProductType>,
  allSuppliersProducts: [] as Array<CartProductType>,
  newOrdenCurrentStep: 0,
  newOrden: EmptyNewOrden,
  ordenSubmitted: {
    id: undefined as string | undefined,
    status: undefined as string | undefined,
  },
  // validate pre-ordenes
  productsToValidate: [] as Array<ProductValidationType>,
  byProductFilters: {
    search: "",
    supplier: [],
    createdBy: [],
  },
  // external
  externalOrdenDetails: {} as OrdenType | null,
  externalInvoiceStatus: {
    success: false,
    message: "",
  },
};

const slice = createSlice({
  name: "orden",
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // RESET STATE
    resetState(state) {
      state = initialState;
    },
    // FINISH PROCESS
    finishProcess(state) {
      state.inProcess = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // SET Active Pagos
    addActivePagosSuccess(state, action) {
      state.isLoading = false;
      state.activePagos = action.payload;
    },
    // SET Active Pagos Filters
    addActivePagosFiltersSuccess(state, action) {
      state.isLoading = false;
      state.activePagosFilters = action.payload;
    },
    // SET Active Pagos Search
    addActivePagosSearchSuccess(state, action) {
      state.isLoading = false;
      state.activePagosFilters.search = action.payload;
    },
    //  SET Active Pagos date range
    addPagosDateRangeSuccess(state, action) {
      state.isLoading = false;
      state.activePagosFilters.dateRange = action.payload;
    },
    // SET Active Facturas
    addActiveFacturasSuccess(state, action) {
      state.isLoading = false;
      state.activeFacturas = action.payload;
    },
    // SET Active Invoices By Orden
    addActiveInvoicesOrdenSuccess(state, action) {
      state.isLoading = false;
      state.activeInvoicesOrden = action.payload;
    },
    // SET Active Facturas Filters
    addActiveFacturasFiltersSuccess(state, action) {
      state.isLoading = false;
      state.activeFacturasFilters = action.payload;
    },
    // SET Active Facturas Search
    addActiveFacturasSearchSuccess(state, action) {
      state.isLoading = false;
      state.activeFacturasFilters.search = action.payload;
    },
    //  SET Active Facturas date range
    addFacturasDateRangeSuccess(state, action) {
      state.isLoading = false;
      state.activeFacturasFilters.dateRange = action.payload;
    },
    // SET Active Orders
    addActiveOrdenesSuccess(state, action) {
      state.isLoading = false;
      state.activeOrdenes = action.payload;
    },
    // SET Export Active Orders
    addExportActiveOrdenesSuccess(state, action) {
      state.isLoading = false;
      state.exportActiveOrdenes = action.payload;
    },
    // SET Export Active Facturas
    addExportActiveFacturasSuccess(state, action) {
      state.isLoading = false;
      state.exportActiveFacturas = action.payload;
    },
    // SET Export Active Pagos
    addExportActivePagosSuccess(state, action) {
      state.isLoading = false;
      state.exportActivePagos = action.payload;
    },
    // CLEAR Export Active Orders
    clearExportActiveOrdenes(state) {
      state.isLoading = false;
      state.exportActiveOrdenes = {
        loaded: false,
        file: undefined,
      };
    },
    // CLEAR Export Active Facturas
    clearExportActiveFacturas(state) {
      state.isLoading = false;
      state.exportActiveFacturas = {
        loaded: false,
        file: undefined,
      };
    },
    // CLEAR Export Active Pagos
    clearExportActivePagos(state) {
      state.isLoading = false;
      state.exportActivePagos = {
        loaded: false,
        file: undefined,
      };
    },
    // CLEAR Active Orders
    clearActiveOrdenes(state) {
      state.isLoading = false;
      state.activeOrdenes = [];
    },
    // CLEAR Active Facturas
    clearActiveFacturas(state) {
      state.isLoading = false;
      state.activeFacturas = [];
    },
    // CLEAR Active Invoices By Orden
    clearActiveInvoicesOrden(state) {
      state.isLoading = false;
      state.activeInvoicesOrden = [];
    },
    // CLEAR Active Pagos
    clearActivePagos(state) {
      state.isLoading = false;
      state.activePagos = [];
    },
    // SET Active Ordenes Filters
    addActiveOrdenesFiltersSuccess(state, action) {
      state.isLoading = false;
      state.activeFilters = action.payload;
    },
    // SET ACtive ordenes Search
    addActiveOrdenesSearchSuccess(state, action) {
      state.isLoading = false;
      state.activeFilters.search = action.payload;
    },
    // SET Active ordenes date range
    addActiveOrdenesDateRangeSuccess(state, action) {
      state.isLoading = false;
      state.activeFilters.dateRange = action.payload;
    },
    // GET orden details
    getOrdenDetailsSuccess(state, action) {
      state.isLoading = false;
      state.ordenDetailsNotFound = false;
      state.ordenDetails = action.payload;
    },
    // SET orden details not found
    setOrdenDetailsNotFound(state, action) {
      state.isLoading = false;
      state.ordenDetailsNotFound = action.payload;
    },
    // GET invoice details
    getInvoiceDetailsSuccess(state, action) {
      state.isLoading = false;
      state.invoiceDetailsNotFound = false;
      state.invoiceDetails = action.payload;
    },
    // GET invoice details
    clearInvoiceDetailsSuccess(state) {
      state.isLoading = false;
      state.invoiceDetailsNotFound = true;
      state.invoiceDetails = {};
    },
    // SET invoice details not found
    setInvoiceDetailsNotFound(state, action) {
      state.isLoading = false;
      state.invoiceDetailsNotFound = action.payload;
    },
    // SET invoice execution status
    setInvoiceExecStatus(state, action) {
      state.isLoading = false;
      state.invoiceExecStatus = action.payload;
    },
    // set paystatus details
    setPaystatusDetailsSuccess(state, action) {
      state.isLoading = false;
      state.paymentStatusDetails = action.payload;
    },
    // Recalculate Cart Totals
    recalculateCartTotals(state) {
      // compute cart totals
      const _cartTotals = computeCartTotals(
        state.newOrden.cart.cartProducts,
        state.newOrden.shippingCost
      );
      const _newOrden = {
        ...state.newOrden,
        ..._cartTotals,
        cart: {
          ...state.newOrden.cart,
          cartProducts: _cartTotals.cart.cartProducts,
        },
      };
      state.newOrden = _newOrden;
    },
    // Next Current Step
    nextCurrentStep(state) {
      state.newOrdenCurrentStep += 1;
      // compute cart totals
      const _cartTotals = computeCartTotals(
        state.newOrden.cart.cartProducts,
        state.newOrden.shippingCost
      );
      const _newOrden = {
        ...state.newOrden,
        ..._cartTotals,
        cart: {
          ...state.newOrden.cart,
          cartProducts: _cartTotals.cart.cartProducts,
        },
      };
      state.newOrden = _newOrden;
    },
    // previous Current Step
    previousCurrentStep(state) {
      state.newOrdenCurrentStep -= 1;
    },
    // Reset Current Step
    resetCurrentStep(state) {
      state.newOrdenCurrentStep = 0;
    },
    // set new orden
    setNewOrdenSuccess(state, action) {
      state.newOrden = action.payload;
    },
    // set submitted orden
    setOrdenSubmittedSuccess(state, action) {
      state.isLoading = false;
      state.ordenSubmitted = action.payload;
    },
    // clear submitted orden
    clearOrdenSubmitted(state) {
      state.ordenSubmitted = {
        id: undefined,
        status: undefined,
      };
    },
    // clear new orden
    clearNewOrden(state) {
      state.newOrden = EmptyNewOrden;
    },
    // set supplier
    setClientSuccess(state, action) {
      state.newOrden.restaurantBranch = action.payload;
    },
    // get supplier products
    getSupplierProductsSuccess(state, action) {
      state.supplierProducts = action.payload;
    },
    // clear new orden
    clearSupplierProducts(state) {
      state.supplierProducts = [];
    },
    // get all supplier products
    getAllSupplierProductsSuccess(state, action) {
      state.allSuppliersProducts = action.payload;
    },
    // update product quantity
    updateProductQuantitySuccess(state, action) {
      const index = state.newOrden.cart.cartProducts.findIndex(
        (product) =>
          product.supplierProduct.id === action.payload.supplierProduct.id
      );
      if (
        action.payload.quantity < 0 ||
        action.payload.quantity.toString() === "NaN"
      ) {
        return;
      }
      if (index >= 0) {
        state.newOrden.cart.cartProducts[index].quantity =
          action.payload.quantity;
        state.newOrden.cart.cartProducts[index].total =
          action.payload.quantity *
          (action.payload.supplierProduct?.unitMultiple || 1) *
          (action.payload?.price?.amount || 0);
      } else {
        state.newOrden.cart.cartProducts.push({
          ...action.payload,
          total:
            action.payload.quantity *
            (action.payload.supplierProduct?.unitMultiple || 1) *
            (action.payload?.price?.amount || 0),
        });
      }
    },
    // initialize cart
    initializeCartSuccess(state, action) {
      state.newOrden.cart = action.payload;
    },
    // update new orden properties
    updateNewOrdenSuccess(state, action) {
      state.newOrden = {
        ...state.newOrden,
        [action.payload.key]: action.payload.value,
      };
    },
    // SET Validate Products
    addProductsToValidateSuccess(state, action) {
      state.isLoading = false;
      state.productsToValidate = action.payload;
    },
    // SET By Product Filters
    addByProductFiltersSuccess(state, action) {
      state.isLoading = false;
      state.byProductFilters = action.payload;
    },
    // SET By Product Search
    addByProductSearchSuccess(state, action) {
      state.isLoading = false;
      state.byProductFilters.search = action.payload;
    },
    // SET External Invoice
    setExternalInvoiceSuccess(state, action) {
      state.isLoading = false;
      state.externalInvoiceStatus = action.payload.status;
      state.externalOrdenDetails = action.payload.orden;
    },
    // SET External Invoice
    resetLoadingSuccess(state) {
      state.isLoading = false;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  resetState,
  nextCurrentStep,
  previousCurrentStep,
  resetCurrentStep,
  recalculateCartTotals,
  clearNewOrden,
  clearActiveOrdenes,
  clearActiveFacturas,
  clearActivePagos,
  clearOrdenSubmitted,
  clearExportActiveOrdenes,
  clearExportActiveFacturas,
  clearExportActivePagos,
  clearSupplierProducts,
  clearActiveInvoicesOrden,
  clearInvoiceDetailsSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

/**
 * Get active ordenes orden details
 * @param unit UnitType
 * @param dateRange { start: Date; end: Date }
 * @param token string
 * @returns
 */
export function setActiveOrdenes(
  unit: UnitType,
  dateRange: { start: Date; end: Date },
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ACTIVE_ORDENES_BY_UNIT,
        variables: {
          unitId: unit.id,
          fromDate: fISODate(dateRange.start),
          untilDate: fISODate(dateRange.end),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getOrdenes) {
        throw new Error("Data is undefined");
      }
      if (data?.getOrdenes.length === 0 || data?.getOrdenes[0].code > 0) {
        dispatch(slice.actions.addActiveOrdenesSuccess([]));
        return;
      }
      const ordenes = data.getOrdenes;
      // fetch invoice related info
      const ordenIds = ordenes.map((o: any) => o.details.ordenId);
      let invoices: any[] = [];
      try {
        const { data: invData, error: invError } = await graphQLFetch({
          query: GET_MULTIPLE_INVOICES,
          variables: {
            ordenIds: ordenIds,
          },
          headers: {
            Authorization: `restobasic ${token}`,
          },
        });
        if (invError) {
          console.warn("No Invoice Data", invError);
        }
        if (!invData && !invData?.getInvoices) {
          console.warn("No Invoice Data");
        }
        if (
          invData?.getInvoices.length === 0 ||
          invData?.getInvoices[0].code > 0
        ) {
          console.log("No invoices related");
          invoices = [];
        } else {
          invoices = invData.getInvoices;
        }
      } catch (error: any) {
        console.warn("Issues setting historic invoices");
      }
      dispatch(
        slice.actions.addActiveOrdenesSuccess(
          ordenes.map((o: any) => {
            const sInvoice = invoices.find(
              (i: any) => i.ordenId === o.details.ordenId
            ) || {
              satInvoiceUuid: undefined,
            };
            return {
              id: o.id,
              ordenNumber: o.ordenNumber,
              ordenType: o.ordenType,
              status: o.status.status.toLowerCase() as ordenStatusType,
              paystatus: o.paystatus.status.toLowerCase() as paymentStatusType,
              paymentMethod: o.details.paymentMethod.toLowerCase(),
              restaurantBranch: {
                ...o.branch,
                id: o.details.restaurantBranchId,
              },
              supplier: {
                ...o.supplier.supplierUnit,
                phoneNumber: o.supplier.supplierBusinessAccount.phoneNumber,
                email: o.supplier.supplierBusinessAccount.email,
                displayName: o.supplier.supplierBusiness.name,
              },
              cart: {
                id: undefined, // not used in active ordenes listing
                cartProducts: o.cart.map(
                  (p: any) =>
                    ({
                      id: "",
                      supplierProduct: {
                        id: "",
                        productDescription: "",
                        sellUnit: "",
                      },
                      quantity: p.quantity,
                      price: undefined,
                      total: p.subtotal,
                    } as CartProductType)
                ), // not used in active ordenes listing
              },
              deliveryDate: o.details.deliveryDate,
              deliveryTime: `${o.details.deliveryTime.start} - ${o.details.deliveryTime.end}`,
              deliveryType:
                o.details.deliveryType === "PICKUP" ? "pickup" : "delivery",
              subtotal: o.details.subtotal,
              total: o.details.total,
              createdAt: o.details.createdAt,
              lastUpdated: o.details.createdAt, // same as created at given data model
              invoice: {
                ...sInvoice,
              },
            } as OrdenType & { invoice: InvoiceType };
          })
        )
      );
    } catch (error: any) {
      console.warn("Issues setting active ordenes");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

/**
 * Get active ordenes orden details
 * @param ordenId string
 * @param token string
 * @returns
 */
export function getInvoicesByOrden(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("ordenId is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch invoice related info
      let invoices: any[] = [];
      try {
        const { data: invData, error: invError } = await graphQLFetch({
          query: GET_INVOICES_BY_ORDEN,
          variables: {
            ordenId: ordenId,
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
        });
        if (invError) {
          console.warn("No Invoice Data", invError);
        }
        if (!invData && !invData?.getInvoiceDetailsByOrdenSupply) {
          console.warn("No Invoice Data");
        }
        if (
          invData?.getInvoiceDetailsByOrdenSupply.length === 0 ||
          invData?.getInvoiceDetailsByOrdenSupply[0].code > 0
        ) {
          console.log("No invoices related");
          dispatch(slice.actions.addActiveInvoicesOrdenSuccess([]));
          return;
        } else {
          invoices = invData.getInvoiceDetailsByOrdenSupply;
        }
      } catch (error: any) {
        console.warn("Issues setting historic invoices");
      }
      dispatch(
        slice.actions.addActiveInvoicesOrdenSuccess(
          invoices.map((o: any) => {
            let _pdfFile: Blob | undefined = undefined;
            let _xmlFile: Blob | undefined = undefined;
            if (o.pdfFile) {
              _pdfFile = decodeFile({
                content: o.pdfFile,
                mimetype: "application/pdf",
                filename: `factura-${o.satInvoiceUuid}.pdf`,
              });
            }
            if (o.xmlFile) {
              _xmlFile = decodeFile({
                content: o.xmlFile,
                mimetype: "application/xml",
                filename: `factura-${o.satInvoiceUuid}.xml`,
              });
            }
            return {
              id: o.id,
              uuid: o.uuid, // MX SAT UUID
              folio: o.folio,
              client: {
                ...o.restaurantBranch,
              },
              supplier: {
                id: o.supplier.id,
                unitName: o.supplier.name,
              },
              total: o.total,
              pdfFile: _pdfFile,
              xmlFile: _xmlFile,
              status: o.status,
              associatedOrdenId: o.ordenId,
              createdAt: o.createdAt,
              cancelResult: o.cancelResult,
            } as InvoiceType;
          })
        )
      );
    } catch (error: any) {
      console.warn("Issues setting active ordenes");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get active facturas details
 * @param unit UnitType
 * @param token string
 * @param dateRange { start?: Date; end?: Date }
 * @param receiver string
 * @param page number
 * @returns
 */
export function getFacturasByRange(
  unit: UnitType,
  token: string,
  dateRange: { start?: Date; end?: Date },
  receiver?: string,
  page?: number
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      const { data, error } = await graphQLFetch({
        query: FIND_INVOICES_BY_RANGE,
        variables: {
          suId: unit.id,
          from: dateRange.start ? fISODate(dateRange.start) : null,
          until: dateRange.end ? fISODate(dateRange.end) : null,
          receiver: receiver || null,
          page: page || 1,
          pageSize: 10,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getInvoiceDetailsByDates) {
        throw new Error("Data is undefined");
      }
      if (
        data?.getInvoiceDetailsByDates.length === 0 ||
        data?.getInvoiceDetailsByDates[0].code === 1005
      ) {
        dispatch(slice.actions.addActiveFacturasSuccess([]));
        return;
      }
      const facturas = data.getInvoiceDetailsByDates;
      dispatch(
        slice.actions.addActiveFacturasSuccess(
          facturas.map((o: any) => {
            let _pdfFile: Blob | undefined = undefined;
            let _xmlFile: Blob | undefined = undefined;
            if (o.pdfFile) {
              _pdfFile = decodeFile({
                content: o.pdfFile,
                mimetype: "application/pdf",
                filename: `factura-${o.satInvoiceUuid}.pdf`,
              });
            }
            if (o.xmlFile) {
              _xmlFile = decodeFile({
                content: o.xmlFile,
                mimetype: "application/xml",
                filename: `factura-${o.satInvoiceUuid}.xml`,
              });
            }
            return {
              id: o.id,
              uuid: o.satInvoiceUuid, // MX SAT UUID
              folio: o.invoiceNumber,
              client: {
                ...o.restaurantBranch,
              },
              supplier: {
                id: o.supplier.id,
                unitName: o.supplier.name,
              },
              total: o.total,
              pdfFile: _pdfFile,
              xmlFile: _xmlFile,
              status: o.status,
              associatedOrdenId: o.ordenId,
              createdAt: o.createdAt,
            } as InvoiceType;
          })
        )
      );
    } catch (error: any) {
      console.warn("Issues setting facturas list");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

/**
 * Get active pagos details
 * @param unit UnitType
 * @param token string
 * @param dateRange { start?: Date; end?: Date }
 * @param comments string
 * @param page number
 * @returns
 */
export function getPagosByRange(
  unit: UnitType,
  token: string,
  dateRange: { start?: Date; end?: Date },
  comments?: string,
  page?: number
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_PAYMENT_DETAILS_BY_DATE,
        variables: {
          suId: unit.id,
          from: dateRange.start ? fISODate(dateRange.start) : null,
          until: dateRange.end ? fISODate(dateRange.end) : null,
          comments: comments || null,
          page: page || 1,
          pageSize: 10,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getPaymentDetailsByDates) {
        throw new Error("Data is undefined");
      }
      if (
        data?.getPaymentDetailsByDates.length === 0 ||
        data?.getPaymentDetailsByDates[0].code > 0
      ) {
        console.warn("No pagos");
        dispatch(slice.actions.addActivePagosSuccess([]));
        return;
      }
      const pagos = data.getPaymentDetailsByDates;
      dispatch(
        slice.actions.addActivePagosSuccess(
          pagos.map((pr: any) => {
            let jData = null;
            let pfile = null;
            if (pr.evidenceFile) {
              jData = JSON.parse(pr.evidenceFile);
              pfile = decodeFile(jData);
            }
            const ordenes: PaymentReceiptOrdenType[] = [];
            // Formating complements
            pr.ordenes.map((ord: any) => {
              const tempOrd = { ...ord };
              let _pdfFile: Blob | undefined = undefined;
              let _xmlFile: Blob | undefined = undefined;
              let complement = tempOrd.paymentComplement;
              if (complement) {
                if (complement.pdfFile) {
                  _pdfFile = decodeFile({
                    content: complement.pdfFile,
                    mimetype: "application/pdf",
                    filename: `factura-${complement.satInvoiceUuid}.pdf`,
                  });
                  complement.pdfFile = _pdfFile;
                }
                if (complement.xmlFile) {
                  _xmlFile = decodeFile({
                    content: complement.xmlFile,
                    mimetype: "application/xml",
                    filename: `factura-${complement.satInvoiceUuid}.xml`,
                  });
                  complement.xmlFile = _xmlFile;
                }
              }
              tempOrd.complement = complement;
              ordenes.push(tempOrd);
              return ordenes;
            });
            return {
              ...pr,
              evidenceFile: pfile,
              ordenes: ordenes,
            } as PaymentReceiptType;
          }) as PayStatusType & { receipts: PaymentReceiptType[] }
        )
      );
    } catch (error: any) {
      console.warn("Issues setting pagos list");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set active facturas filters
 * @param filters
 * @returns
 */
export function setActiveFacturasFilters(filters: any) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveFacturasFiltersSuccess(filters));
    } catch (error) {
      console.warn("Issues setting active filters");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * [DEPRECATED] Set active search, @now using route to set search
 * @param search
 * @returns
 */
export function setActiveFacturasSearch(search: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveFacturasSearchSuccess(search));
    } catch (error) {
      console.warn("Issues setting active search");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set facturas date range
 * @param dateRange
 * @returns
 */
export function setActiveFacturasDateRange(dateRange: {
  start: string;
  end: string;
}) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addFacturasDateRangeSuccess(dateRange));
    } catch (error) {
      console.warn("Issues setting facturas date range");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set active pagos filters
 * @param filters
 * @returns
 */
export function setActivePagosFilters(filters: any) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActivePagosFiltersSuccess(filters));
    } catch (error) {
      console.warn("Issues setting pagos - active filters");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * [DEPRECATED] Set active search - pagos @ now using route to set search
 * @param search
 * @returns
 */
export function setActivePagosSearch(search: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActivePagosSearchSuccess(search));
    } catch (error) {
      console.warn("Issues setting pagos - active search");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set pagos date range
 * @param dateRange
 * @returns
 */
export function setActivePagosDateRange(dateRange: {
  start: string;
  end: string;
}) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addPagosDateRangeSuccess(dateRange));
    } catch (error) {
      console.warn("Issues setting pagos date range");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set ordenes filters
 * @param filters
 * @returns
 */
export function setActiveOrdenesFilters(filters: any) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveOrdenesFiltersSuccess(filters));
    } catch (error) {
      console.warn("Issues setting historic filters");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set historic search
 * @param search
 * @returns
 */
export function setActiveOrdenesSearch(search: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveOrdenesSearchSuccess(search));
    } catch (error) {
      console.warn("Issues setting historic search");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set ordenes date range
 * @param dateRange
 * @returns
 */
export function setActiveOrdenesDateRange(dateRange: {
  start: string | Date;
  end: string | Date;
}) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveOrdenesDateRangeSuccess(dateRange));
    } catch (error) {
      console.warn("Issues setting historic date range");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get ordenes
 *  @param ordenId string
 *  @param token string
 * @returns
 */
export function getOrdenDetails(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: GET_ORDEN_DETAILS,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getOrdenes) {
        throw new Error("Data is undefined");
      }
      if (data?.getOrdenes.length === 0 || data?.getOrdenes[0].code === 1005) {
        dispatch(slice.actions.setOrdenDetailsNotFound(true));
        return;
      }
      const o = data.getOrdenes[0];
      // graphql call for branch
      const { data: dataBr, error: errorBr } = await graphQLFetch({
        query: GET_CLIENT_PROFILE,
        variables: {
          supUnitId: o.details.supplierUnitId,
          branchId: o.details.restaurantBranchId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      let v: any = o.branch;
      if (
        errorBr ||
        !dataBr ||
        !dataBr?.getSupplierRestaurantProducts ||
        dataBr?.getSupplierRestaurantProducts.code
      ) {
        v = {
          ...v,
          category: "N/A",
          displayName: "N/A",
        };
      } else {
        const supResOpt = dataBr.getSupplierRestaurantProducts;
        const resBiz = supResOpt.restaurantBusiness;
        const branch = supResOpt.branch.restaurantBranch;
        const branchCateg = supResOpt.branch.category;
        v = branch;
        v.category = branchCateg.restaurantCategoryId;
        v.displayName = resBiz.name;
        v.phoneNumber = supResOpt?.restaurantBusinessAccount?.phoneNumber;
      }
      dispatch(
        slice.actions.getOrdenDetailsSuccess({
          ...o.details,
          id: o.id,
          ordenNumber: o.ordenNumber,
          ordenType: o.ordenType,
          status: o.status.status.toLowerCase() as ordenStatusType,
          restaurantBranch: {
            id: v.id,
            branchName: v.branchName,
            branchCategory: v.category,
            fullAddress: v.fullAddress, // [TODO] add branch POC number
            displayName: v.displayName,
            phoneNumber: v.phoneNumber,
          },
          supplier: {
            id: o.supplier.supplierBusinessAccount.supplierBusinessId,
            unitName: o.supplier.unit.unitName,
            displayName: o.supplier.supplierBusiness.name,
            email: o.supplier.supplierBusinessAccount.email,
            phoneNumber: o.supplier.supplierBusinessAccount.phoneNumber,
            fullAddress: o.supplier.unit.fullAddress,
          },
          cart: {
            id: o.details.cartId,
            cartProducts: o.cart.map(
              (p: any) =>
                ({
                  id: p.suppProd.id, // using this ID only for reference in frontend
                  supplierProduct: {
                    id: p.suppProd.id,
                    productDescription: p.suppProd.description,
                    sellUnit: p.suppProd.sellUnit,
                    sku: p.suppProd.sku,
                    minimumQuantity: p.suppProd.minQuantity,
                    unitMultiple: p.suppProd.unitMultiple,
                    estimatedWeight: p.suppProd.estimatedWeight,
                    taxAmount: p.suppProd.taxAmount,
                    iepsAmount: p.iepaAmount,
                    stock: p.suppProd.stock,
                  },
                  quantity: p.quantity,
                  price: {
                    uuid: p.supplierProductPriceId,
                    amount: p.unitPrice,
                    unit: "MXN", // hard coded for now
                    validUntil: o.details.deliveryDate, // placed for reference only
                  },
                  total: p.subtotal,
                } as CartProductType)
            ), // not used in active ordenes listing
          },
          deliveryTime: `${o.details.deliveryTime.start} - ${o.details.deliveryTime.end}`,
          deliveryType:
            o.details.deliveryType === "PICKUP" ? "pickup" : "delivery",
          lastUpdated: o.details.createdAt, // same as created at given data model
          createdBy: {
            id: o.details.createdBy,
            firstName: "", // not used
            lastName: "", // not used
            email: "", // not used
          },
        } as OrdenType)
      );
    } catch (error: any) {
      console.warn("Issues getting orden details");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(slice.actions.setOrdenDetailsNotFound(true));
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Get invoice execution status
 * @param ordenId string
 * @param token string
 * @returns
 */
export function getInvoiceExecStatus(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: FETCH_INVOICE_EXEC_STATUS,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getSupplierInvoiceExecutionStatus) {
        throw new Error("Data is undefined");
      }
      if (data?.getSupplierInvoiceExecutionStatus.code > 0) {
        console.debug(
          `${data?.getSupplierInvoiceExecutionStatus.code} - ${data?.getSupplierInvoiceExecutionStatus.msg}`
        );
        dispatch(
          slice.actions.setInvoiceExecStatus({
            id: "error",
            result: `No se pudo obtener el estátus de la factura: ${data?.getSupplierInvoiceExecutionStatus.msg}`,
            status: ExecutionStatusTypes.FAILED,
          } as InvoiceExecutionStatusType)
        );
        return;
      }
      const invSts = data.getSupplierInvoiceExecutionStatus;
      dispatch(
        slice.actions.setInvoiceExecStatus({
          ...invSts,
        } as InvoiceExecutionStatusType)
      );
    } catch (error: any) {
      console.warn("Issues getting invoice exec info");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Trigger invoice generation
 * @param ordenId string
 * @param token string
 * @returns
 */
export function triggerGenerateInvoice(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: TRIGGER_GENERATE_INVOICE,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.createSupplierInvoice) {
        throw new Error("Data is undefined");
      }
      if (data?.createSupplierInvoice.code > 0) {
        console.debug(
          `${data?.createSupplierInvoice.code} - ${data?.createSupplierInvoice.msg}`
        );
        dispatch(
          slice.actions.setInvoiceExecStatus({
            id: "error",
            result: `No se pudo generar la factura: ${data?.getSupplierInvoiceExecutionStatus.msg}`,
            status: ExecutionStatusTypes.FAILED,
          } as InvoiceExecutionStatusType)
        );
        return;
      }
      const invSts = data.getSupplierInvoiceExecutionStatus;
      dispatch(
        slice.actions.setInvoiceExecStatus({
          ...invSts,
        } as InvoiceExecutionStatusType)
      );
    } catch (error: any) {
      console.warn("Issues generating invoice");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * cancel invoice
 * @param ordenId string
 * @param token string
 * @returns
 */
export function cancelInvoice(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: CANCEL_INVOICE,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.cancelCustomerInvoice) {
        throw new Error("Data is undefined");
      }
      if (data?.cancelCustomerInvoice.code > 0) {
        console.debug(
          `${data?.cancelCustomerInvoice.code} - ${data?.cancelCustomerInvoice.msg}`
        );
        if (data?.cancelCustomerInvoice.msg === "This order has a complement") {
          throw new Error("La factura tiene complemento");
        }
        throw new Error("Error");
      }
      const invSts = data.cancelCustomerInvoice;
      if (invSts.canceled === false) {
        throw new Error("Error to cancel order");
      }
    } catch (error: any) {
      console.warn("Issues to cancel invoice");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Get invoice details
 * @param ordenId string
 * @param token string
 * @returns
 */
export function getInvoiceDetails(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: GET_INVOICE_DETAILS,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getInvoiceDetails) {
        throw new Error("Data is undefined");
      }
      if (data?.getInvoiceDetails.code === 1005) {
        dispatch(slice.actions.setInvoiceDetailsNotFound(true));
        return;
      }
      if (data?.getInvoiceDetails.code > 0) {
        console.debug(
          `${data?.getInvoiceDetails.code} - ${data?.getInvoiceDetails?.msg}`
        );
        throw new Error(data?.getInvoiceDetails.msg);
      }
      const iv = data.getInvoiceDetails;
      let _pdfFile: Blob | undefined = undefined;
      let _xmlFile: Blob | undefined = undefined;
      if (iv.pdfFile) {
        _pdfFile = decodeFile({
          content: iv.pdfFile,
          mimetype: "application/pdf",
          filename: `factura-${iv.invoiceNumber}.pdf`,
        });
      }
      if (iv.xmlFile) {
        _xmlFile = decodeFile({
          content: iv.xmlFile,
          mimetype: "application/xml",
          filename: `factura-${iv.invoiceNumber}.xml`,
        });
      }
      dispatch(
        slice.actions.getInvoiceDetailsSuccess({
          id: iv.id,
          uuid: iv.satInvoiceUuid, // MX SAT UUID
          folio: iv.invoiceNumber,
          client: {
            ...iv.restaurantBranch,
          },
          supplier: undefined, // [TODO] add supplier details
          total: iv.total,
          pdfFile: _pdfFile,
          xmlFile: _xmlFile,
          status: iv.status,
        } as InvoiceType)
      );
    } catch (error: any) {
      console.warn("Issues getting invoice details");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Get invoice details
 * @param ordenId string
 * @param token string
 * @returns
 */
export function getPaymentDetails(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call for orden details
      const { data, error } = await graphQLFetch({
        query: GET_PAYSTATUS_DETAILS,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data && !data?.getOrdenPaystatus) ||
        data?.getOrdenPaystatus.length === 0
      ) {
        throw new Error("Data is undefined");
      }
      if (data?.getOrdenPaystatus[0]?.code > 0) {
        console.debug(
          `${data?.getOrdenPaystatus[0]?.code} - ${data?.getOrdenPaystatus[0]?.msg}`
        );
        throw new Error(data?.getOrdenPaystatus[0]?.msg);
      }
      const gop = [...data.getOrdenPaystatus] as any[];
      gop.sort((a, b) => {
        if (a.paystatus.createdAt > b.paystatus.createdAt) {
          return -1;
        }
        if (a.paystatus.createdAt < b.paystatus.createdAt) {
          return 1;
        }
        return 0;
      });
      const iv = gop[0];
      dispatch(
        slice.actions.setPaystatusDetailsSuccess({
          ...iv.paystatus,
          status: iv.paystatus?.status?.toLowerCase() as paymentStatusType,
          createdBy: {
            ...iv.coreUser,
          },
          receipts: iv.payReceipts.map((pr: any) => {
            let jData = null;
            let pfile = null;
            const ordenes: PaymentReceiptOrdenType[] = [];
            // Formating complements
            pr.ordenes.map((ord: any) => {
              const tempOrd = { ...ord };
              let _pdfFile: Blob | undefined = undefined;
              let _xmlFile: Blob | undefined = undefined;
              let complement = tempOrd.paymentComplement;
              if (complement) {
                if (complement.pdfFile) {
                  _pdfFile = decodeFile({
                    content: complement.pdfFile,
                    mimetype: "application/pdf",
                    filename: `factura-${complement.satInvoiceUuid}.pdf`,
                  });
                  complement.pdfFile = _pdfFile;
                }
                if (complement.xmlFile) {
                  _xmlFile = decodeFile({
                    content: complement.xmlFile,
                    mimetype: "application/xml",
                    filename: `factura-${complement.satInvoiceUuid}.xml`,
                  });
                  complement.xmlFile = _xmlFile;
                }
              }
              tempOrd.complement = complement;
              ordenes.push(tempOrd);
              return ordenes;
            });
            // Formating evidence
            if (pr.evidenceFile) {
              jData = JSON.parse(pr.evidenceFile);
              pfile = decodeFile(jData);
            }
            return {
              ...pr,
              evidenceFile: pfile,
              ordenes: ordenes,
            } as PaymentReceiptType;
          }),
        } as PayStatusType & { receipts: PaymentReceiptType[] })
      );
    } catch (error: any) {
      console.warn("Issues getting payment details");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Set new orden client
 * @param client
 * @returns
 */
export function setNewOrdenClient(client: ClientProfileType | {}) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.setClientSuccess(client));
    } catch (error) {
      console.warn("Issues setting new orden client");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Get supplier products
 * @param client
 * @returns
 */
export function getClientCatalog(
  client: ClientProfileType & { products: SupplierProductType[] }
) {
  return async (dispatch: any) => {
    try {
      // call from API
      if (client && client.products && client.products?.length > 0) {
        dispatch(
          slice.actions.getSupplierProductsSuccess(
            client.products.map(
              (p: SupplierProductType) =>
                ({
                  supplierProduct: p,
                  quantity: 0,
                  price: p.price,
                } as CartProductType)
            )
          )
        );
      } else {
        dispatch(slice.actions.getSupplierProductsSuccess([]));
      }
    } catch (error: any) {
      console.warn("Issues getting client catalog");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Update product Quantity
 * @param product
 * @returns
 */
export function updateProductQuantity(product: CartProductType) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.updateProductQuantitySuccess(product));
    } catch (error) {
      console.warn("Issues updating product quantity");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set Values in Cart
 * @param cart
 * @returns
 */
export function initializeCart(cart: CartType) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.initializeCartSuccess(cart));
    } catch (error) {
      console.warn("Issues initializing cart");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 *  Update new Orden property
 * @param ordenProp
 * @returns
 */
export function updateNewOrden(ordenProp: { key: string; value: any }) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.updateNewOrdenSuccess(ordenProp));
    } catch (error) {
      console.warn("Issues updating new orden property");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Submit new Orden to API
 * @param supplierBusinessId string
 * @param newOrden OrdenType
 * @param token string
 * @returns
 */
export function submitNewOrdenNormal(
  supplierBusinessId: string,
  newOrden: OrdenType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!newOrden.restaurantBranch?.id) {
        throw new Error("Branch Id is undefined");
      }
      if (!newOrden.supplier?.id) {
        throw new Error("Supplier Unit Id is undefined");
      }
      if (!supplierBusinessId) {
        throw new Error("Supplier Business Id is undefined");
      }
      const _delivTime = newOrden.deliveryTime?.split(" - ");
      // build optional variables
      let optVars = {};
      if (newOrden.shippingCost) {
        optVars = {
          shipping: newOrden.shippingCost,
        };
      }
      // graphql call
      const { data, error } = await graphQLFetch({
        query: NEW_SUPPLIER_ORDEN,
        variables: {
          cartProds: newOrden.cart.cartProducts.map((p: CartProductType) => ({
            supplierProductId: p.supplierProduct.id,
            supplierProductPriceId: p?.price?.uuid || null,
            quantity: p.quantity * (p.supplierProduct?.unitMultiple || 1),
            unitPrice: p?.price?.amount || null,
            subtotal: p?.total || null,
            sellUnit: p.supplierProduct.sellUnit.toUpperCase(),
          })),
          restaurantBranchId: newOrden.restaurantBranch?.id,
          deliveryDate: newOrden.deliveryDate,
          deliveryTime: {
            start: _delivTime ? parseInt(_delivTime[0]) : 9,
            end: _delivTime ? parseInt(_delivTime[1]) : 18,
          },
          delivType:
            newOrden.deliveryType === "delivery"
              ? "SCHEDULED_DELIVERY"
              : "PICKUP",
          supBId: supplierBusinessId,
          supUnitId: newOrden.supplier.id,
          paymethod: newOrden.paymentMethod?.toUpperCase() || "CASH",
          comms: newOrden?.comments || "",
          ...optVars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.newOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      const supp = data.newOrdenMarketplace;
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: supp.id,
          status: supp.status.status,
        })
      );
    } catch (error: any) {
      console.warn("Issues submitting new orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: undefined,
          status: "error",
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Submit Update Orden to API
 * @param ordenId string
 * @param cart CartProductType[]
 * @param deliveryDate Date
 * @param deliveryTime string (format: 'SS - EE')
 * @param comments string
 * @param token string
 * @param deliveryType DeliveryType
 * @returns
 */
export function submitUpdateOrden(
  ordenId: string,
  cart: CartProductType[],
  deliveryDate: Date,
  deliveryTime: string,
  comments: string,
  paymentMethod: string,
  token: string,
  deliveryType: DeliveryType = "delivery",
  shippingCost?: number
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!ordenId) {
        throw new Error("Orden Id is undefined");
      }
      // build optional variables
      let optVars = {};
      if (shippingCost) {
        optVars = {
          shipping: shippingCost,
        };
      }
      // graphql call
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_ORDEN,
        variables: {
          ordenId: ordenId,
          cart: cart.map((p: CartProductType) => ({
            supplierProductId: p.supplierProduct.id,
            supplierProductPriceId: p?.price?.uuid || null,
            quantity: p.quantity * (p.supplierProduct?.unitMultiple || 1),
            unitPrice: p?.price?.amount || null,
            subtotal: p?.total || null,
            sellUnit: p.supplierProduct.sellUnit.toUpperCase(),
          })),
          delivDate: fISODate(deliveryDate),
          delivTime: {
            start: parseInt(deliveryTime.split(" - ")[0]),
            end: parseInt(deliveryTime.split(" - ")[1]),
          },
          delivType:
            deliveryType.toUpperCase() === "PICKUP"
              ? "PICKUP"
              : "SCHEDULED_DELIVERY",
          comments: comments || "",
          paymentMethod: paymentMethod.toUpperCase(),
          ...optVars,
          // [TODO] - add service fee, delivery fee, shipping Cost, etc
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      const supp = data.updateOrdenMarketplace;
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: supp.id,
          status: supp.status.status,
        })
      );
    } catch (error: any) {
      console.warn("Issues submitting updated orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: undefined,
          status: "error",
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Submit Update Orden to API
 * @param ordenId string
 * @returns
 */
export function submitUpdateOrdenPaymentMethod(
  ordenId: string,
  paymentMethod: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!ordenId) {
        throw new Error("Orden Id is undefined");
      }

      // graphql call
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_ORDEN_PAYMENT_METHOD,
        variables: {
          ordenId: ordenId,
          paymentMethod: paymentMethod.toUpperCase(),
          
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      dispatch(
        slice.actions.resetLoadingSuccess(
        )
      );
    } catch (error: any) {
      console.warn("Issues submitting updated orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.resetLoadingSuccess(
        )
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Submit Update Orden to API
 * @param ordenId string
 * @param cart CartProductType[]
 * @param deliveryDate Date
 * @param deliveryTime string (format: 'SS - EE')
 * @param comments string
 * @param token string
 * @param deliveryType DeliveryType
 * @returns
 */
export function submitReInvoiceOrden(
  ordenId: string,
  cart: CartProductType[],
  deliveryDate: Date,
  deliveryTime: string,
  comments: string,
  paymentMethod: string,
  token: string,
  deliveryType: DeliveryType = "delivery",
  shippingCost?: number
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!ordenId) {
        throw new Error("Orden Id is undefined");
      }
      // build optional variables
      let optVars = {};
      if (shippingCost) {
        optVars = {
          shipping: shippingCost,
        };
      }
      // graphql call
      const { data, error } = await graphQLFetch({
        query: REINVOICE_SUPPLIER_ORDEN,
        variables: {
          ordenId: ordenId,
          cart: cart.map((p: CartProductType) => ({
            supplierProductId: p.supplierProduct.id,
            supplierProductPriceId: p?.price?.uuid || null,
            quantity: p.quantity * (p.supplierProduct?.unitMultiple || 1),
            unitPrice: p?.price?.amount || null,
            subtotal: p?.total || null,
            sellUnit: p.supplierProduct.sellUnit.toUpperCase(),
          })),
          delivDate: fISODate(deliveryDate),
          delivTime: {
            start: parseInt(deliveryTime.split(" - ")[0]),
            end: parseInt(deliveryTime.split(" - ")[1]),
          },
          delivType:
            deliveryType.toUpperCase() === "PICKUP"
              ? "PICKUP"
              : "SCHEDULED_DELIVERY",
          comments: comments || "",
          paymentMethod: paymentMethod.toUpperCase(),
          ...optVars,
          // [TODO] - add service fee, delivery fee, shipping Cost, etc
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.reInvoiceOrder) {
        throw new Error("Data is undefined");
      }
      if (data?.reInvoiceOrder.code > 0) {
        if (data?.reInvoiceOrder.msg === "This order has a complement") {
          throw new Error("La factura tiene complemento");
        }
      }
      const supp = data.reInvoiceOrder;
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: supp.id,
          status: supp.status.status,
        })
      );
    } catch (error: any) {
      console.warn("Issues submitting updated orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.setOrdenSubmittedSuccess({
          id: undefined,
          status: "error",
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Set new orden with a draft
 * @param newOrden
 * @returns
 */
export function setNewOrden(newOrden: OrdenType) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.setNewOrdenSuccess(newOrden));
    } catch (error) {
      console.warn("Issues setting new orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get products to validate
 * @param
 * @returns
 */
export function getProductsToValidate() {
  return async (dispatch: any) => {
    try {
      // [TODO] Get from API and add response to state
      // decompose pre ordenes expanding all products
      const resp = {
        data: []
          .map((o: OrdenType) => {
            return o.cart.cartProducts.map((p: CartProductType) => ({
              ...p,
              supplier: o.supplier,
              createdBy: o.createdBy,
            }));
          })
          .reduce((a, b) => a.concat(b), []),
      };
      dispatch(slice.actions.addProductsToValidateSuccess(resp.data));
      console.log("DISABLED - getProductToValidate");
    } catch (error) {
      console.warn("Issues setting products to validate");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set by product filters
 * @param filters
 * @returns
 */
export function setByProductFilters(filters: any) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addByProductFiltersSuccess(filters));
    } catch (error) {
      console.warn("Issues setting By product filters");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set By Product search
 * @param search
 * @returns
 */
export function setByProductSearch(search: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addByProductSearchSuccess(search));
    } catch (error) {
      console.warn("Issues setting by Product Search");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Cancel Orden
 * @param ordenId
 * @param token
 * @returns
 */
export function cancelOrden(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call to cancel orden
      const { data, error } = await graphQLFetch({
        query: CANCEL_ORDEN,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      if (data?.updateOrdenMarketplace.code > 0) {
        throw new Error(data?.updateOrdenMarketplace.msg);
      }
      if (
        data?.updateOrdenMarketplace.status.status.toLowerCase() === "canceled"
      ) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Orden not canceled");
      }
    } catch (error: any) {
      console.warn("Issues canceling orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Confirm Orden
 * @param ordenId
 * @param token
 * @returns
 */
export function confirmOrden(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetch({
        query: CONFIRM_ORDEN,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      if (data?.updateOrdenMarketplace.code > 0) {
        throw new Error(data?.updateOrden.msg);
      }
      if (
        data?.updateOrdenMarketplace.status.status.toLowerCase() === "accepted"
      ) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Orden not confirmed");
      }
    } catch (error: any) {
      console.warn("Issues confirming orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

/**
 * Deliver Orden
 * @param ordenId
 * @param token
 * @returns
 */
export function deliverOrden(ordenId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetch({
        query: DELIVER_ORDEN,
        variables: {
          ordenId: ordenId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      if (data?.updateOrdenMarketplace.code > 0) {
        throw new Error(data?.updateOrden.msg);
      }
      if (
        data?.updateOrdenMarketplace.status.status.toLowerCase() === "delivered"
      ) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Orden not confirmed");
      }
    } catch (error: any) {
      console.warn("Issues confirming orden");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Export historic ordenes orden details
 * @param exportFormat string
 * @param unit BranchType
 * @param dateRange { start: Date; end: Date }
 * @param token string
 * @returns
 */
export function exportActiveOrdenesFile(
  exportFormat: string,
  unit: UnitType,
  dateRange: { start: Date; end: Date },
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_HISTORIC_ORDENES,
        variables: {
          expFormat: exportFormat,
          supUId: unit.id,
          fromDate: fISODate(dateRange.start),
          toDate: fISODate(dateRange.end),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportOrdenes) {
        throw new Error("Data is undefined");
      }
      if (data?.exportOrdenes.code && data?.exportOrdenes.code > 0) {
        throw new Error("Hubo un error, no se pudo exportar los pedidos.");
      }
      const exportOrd = data.exportOrdenes;
      const jData = JSON.parse(exportOrd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportActiveOrdenesSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting historic ordenes");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportActiveOrdenesSuccess({
          loaded: true,
          file: undefined,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Export historic facturas orden details
 * @param exportFormat string
 * @param unit BranchType
 * @param dateRange { start: Date; end: Date }
 * @param token string
 * @returns
 */
export function exportActiveFacturasFile(
  exportFormat: string,
  unit: UnitType,
  dateRange: { start: Date; end: Date },
  token: string,
  receiver?: string
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_INVOICES_BY_RANGE,
        variables: {
          xformat: exportFormat,
          suId: unit.id,
          from: dateRange.start ? fISODate(dateRange.start) : null,
          until: dateRange.end ? fISODate(dateRange.end) : null,
          receiver: receiver || null,
          page: 1,
          pageSize: 1000, // [TOREV] - check later
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportInvoiceDetailsByDates) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportInvoiceDetailsByDates.code &&
        data?.exportInvoiceDetailsByDates.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar las facturas.");
      }
      const exportOrd = data.exportInvoiceDetailsByDates;
      const jData = JSON.parse(exportOrd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportActiveFacturasSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting historic ordenes");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportActiveFacturasSuccess({
          loaded: true,
          file: undefined,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Export historic pagos orden details
 * @param exportFormat string
 * @param unit BranchType
 * @param dateRange { start: Date; end: Date }
 * @param token string
 * @returns
 */
export function exportActivePagosFile(
  exportFormat: string,
  unit: UnitType,
  dateRange: { start: Date; end: Date },
  token: string,
  receiver?: string
) {
  return async (dispatch: any) => {
    try {
      if (!unit?.id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic pagos
      const { data, error } = await graphQLFetch({
        query: EXPORT_PAYMENT_DETAILS_BY_DATE,
        variables: {
          xformat: exportFormat,
          suId: unit.id,
          from: dateRange.start ? fISODate(dateRange.start) : null,
          until: dateRange.end ? fISODate(dateRange.end) : null,
          comments: receiver || null,
          page: 1,
          pageSize: 1000, // [TOREV] - check later
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportPaymentDetailsByDates) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportPaymentDetailsByDates.code &&
        data?.exportPaymentDetailsByDates.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar las facturas.");
      }
      const exportOrd = data.exportPaymentDetailsByDates;
      const jData = JSON.parse(exportOrd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportActivePagosSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting historic ordenes");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportActivePagosSuccess({
          loaded: true,
          file: undefined,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Update payment status
 * @param ordenId
 * @param token
 * @param paystatus
 * @returns
 */
export function updateOrdenPaystatus(
  ordenId: string,
  token: string,
  paystatus: string
) {
  return async (dispatch: any) => {
    try {
      if (!ordenId) {
        console.warn("Orden Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetch({
        query: UPDATE_PAYSTATUS,
        variables: {
          ordenId: ordenId,
          payStatus: paystatus.toUpperCase(),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateOrdenMarketplace) {
        throw new Error("Data is undefined");
      }
      if (data?.updateOrdenMarketplace.code > 0) {
        throw new Error(data?.updateOrdenMarketplace.msg);
      }
      if (data?.updateOrdenMarketplace.paystatus.status) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Orden Payment not correct");
      }
    } catch (error: any) {
      console.warn("Issues updating orden paystatus");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add payment receipt
 * @param token  string
 * @param ordenIds string[]
 * @param paymentValue number
 * @param comments string
 * @param receiptFile File
 * @param paymentDay Date
 * @returns
 */
export function uploadPayReceipt(
  token: string,
  ordenIds: string[],
  paymentValue: number,
  paymentDay?: Date,
  comments?: string,
  receiptFile?: File,
  paymentComplement?: Boolean
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // build vars
      const vars: any = {
        ordenIds: ordenIds,
        payment: parseFloat(paymentValue.toString()),
        comments: comments || null,
        paymentComplement: paymentComplement,
        paymentDay: paymentDay ? fISODate(paymentDay) : null,
      };
      const _files: any = {};
      const f_map: any = {};
      if (receiptFile) {
        vars.receipt = null;
        _files.receipt = [receiptFile, receiptFile.name];
        f_map.receipt = ["variables.receipt"];
      }
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetchFiles({
        query: ADD_PAYMENT_RECEIPT,
        variables: {
          ...vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            ..._files,
          },
          map: {
            ...f_map,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.addPaymentReceipt) {
        throw new Error("Data is undefined");
      }
      if (data?.addPaymentReceipt.code > 0) {
        throw new Error(data?.addPaymentReceipt?.msg);
      }
      if (data?.addPaymentReceipt.payReceipts[0]?.id) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Payment Receipt not correct");
      }
    } catch (error: any) {
      console.warn("Issues uploading payment receipt");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add payment receipt
 * @param token  string
 * @param ordenIds string[]
 * @param paymentMethod string
 * @returns
 */
export function submitConsolidatedInvoice(
  token: string,
  ordenIds: (string | undefined)[],
  paymentMethod: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // build vars
      if (ordenIds.length === 0 || !ordenIds) {
        console.warn("Orden Ids is undefined");
        return;
      }
      const vars: any = {
        ordenIds: ordenIds,
        paymethod: paymentMethod.toUpperCase() || "CASH",
      };
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetch({
        query: SEND_CONSOLIDATED_INVOICE,
        variables: {
          ...vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.createConsolidatedSupplierInvoice) {
        throw new Error("Data is undefined");
      }
      if (data?.createConsolidatedSupplierInvoice.code > 0) {
        throw new Error(data?.addPaymentReceipt?.msg);
      }
      if (data?.createConsolidatedSupplierInvoice[0].satId) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Invoice Orden Consolidated not correct");
      }
    } catch (error: any) {
      console.warn("Issues to send orden consolidated");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add payment receipt
 * @param token  string
 * @param ordenIds string[]
 * @param paymentMethod string
 * @returns
 */
export function submitConsolidatedPayment(
  token: string,
  ordenIds: (string | undefined)[],
  paymentValue: number,
  paymentDay?: Date,
  comments?: string,
  receiptFile?: File,
  paymentComplement?: Boolean
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // build vars
      if (ordenIds.length === 0 || !ordenIds) {
        console.warn("Orden Ids is undefined");
        return;
      }
      const vars: any = {
        ordenIds: ordenIds,
        payment: parseFloat(paymentValue.toString()),
        comments: comments || null,
        paymentComplement: paymentComplement,
        paymentDay: paymentDay ? fISODate(paymentDay) : null,
      };
      const _files: any = {};
      const f_map: any = {};
      if (receiptFile) {
        vars.receipt = null;
        _files.receipt = [receiptFile, receiptFile.name];
        f_map.receipt = ["variables.receipt"];
      }
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetchFiles({
        query: ADD_PAYMENT_RECEIPT,
        variables: {
          ...vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            ..._files,
          },
          map: {
            ...f_map,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.addPaymentReceipt) {
        throw new Error("Data is undefined");
      }
      if (data?.addPaymentReceipt.code > 0) {
        throw new Error(data?.addPaymentReceipt?.msg);
      }
      if (data?.addPaymentReceipt.payReceipts[0]?.id) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Payment Receipt not correct");
      }
    } catch (error: any) {
      console.warn("Issues uploading payment receipt");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

export function submitConsolidatedOrdenPayment(
  token: string,
  ordenAmounts: { ordenId: string; amount: number }[],
  paymentDay?: Date,
  comments?: string,
  receiptFile?: File,
  paymentComplement?: Boolean
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // build vars
      if (ordenAmounts.length === 0 || !ordenAmounts) {
        console.warn("Orden Ids is undefined");
        return;
      }
      const vars: any = {
        ordenes: ordenAmounts,
        comments: comments || null,
        paymentComplement: paymentComplement,
        paymentDay: paymentDay ? fISODate(paymentDay) : null,
      };
      const _files: any = {};
      const f_map: any = {};
      if (receiptFile) {
        vars.receipt = null;
        _files.receipt = [receiptFile, receiptFile.name];
        f_map.receipt = ["variables.receipt"];
      }
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetchFiles({
        query: ADD_CONSOLIDATED_PAYMENT_RECEIPT,
        variables: {
          ...vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            ..._files,
          },
          map: {
            ...f_map,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.addConsolidatedPaymentReceipt) {
        throw new Error("Data is undefined");
      }
      if (data?.addConsolidatedPaymentReceipt.code > 0) {
        throw new Error(data?.addConsolidatedPaymentReceipt?.msg);
      }
      if (data?.addConsolidatedPaymentReceipt.payReceipts[0]?.id) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Payment Receipt not correct");
      }
    } catch (error: any) {
      console.warn("Issues uploading payment receipt");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add payment receipt
 * @param token  string
 * @param id string
 * @param ordenIds string[]
 * @param paymentValue number
 * @param paymentDay Date
 * @param comments string
 * @param receiptFile File
 * @returns
 */
export function updatePayReceipt(
  token: string,
  id: string,
  ordenIds: string[],
  paymentValue: number,
  paymentDay?: Date,
  comments?: string,
  receiptFile?: File,
  paymentComplement?: Boolean
) {
  return async (dispatch: any) => {
    try {
      if (id === "") {
        throw new Error("Payment Receipt Id is undefined");
      }
      dispatch(slice.actions.startLoading());
      // build vars
      const vars: any = {
        prId: id,
        ordenIds: ordenIds,
        payment: parseFloat(paymentValue.toString()),
        comments: comments || null,
        paymentDay: paymentDay ? fISODate(paymentDay) : null,
        paymentComplement: paymentComplement,
      };
      const _files: any = {};
      const f_map: any = {};
      if (receiptFile) {
        vars.receipt = null;
        _files.receipt = [receiptFile, receiptFile.name];
        f_map.receipt = ["variables.receipt"];
      }
      // grapqhl call to confirm orden
      const { data, error } = await graphQLFetchFiles({
        query: EDIT_PAYMENT_RECEIPT,
        variables: {
          ...vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            ..._files,
          },
          map: {
            ...f_map,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.editPaymentReceipt) {
        throw new Error("Data is undefined");
      }
      if (data?.editPaymentReceipt.payReceipts[0]?.id) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new Error("Payment Receipt not correct");
      }
    } catch (error: any) {
      console.warn("Issues uploading payment receipt");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
