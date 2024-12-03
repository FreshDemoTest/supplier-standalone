// redux
import { createSlice } from "@reduxjs/toolkit";
// domain
import {
  MxSatProductCodeType,
  SupplierProductType,
} from "../../domain/supplier/SupplierProduct";
// graphql
import { graphQLFetch, graphQLFetchFiles } from "../../utils/graphql";
import {
  ADD_SUPPLIER_PRODUCT_IMAGE,
  CREATE_NEW_SUPPLIER_PRICE_LIST,
  CREATE_NEW_SUPPLIER_STOCK_LIST,
  DELETE_SUPPLIER_PRODUCT_IMAGE,
  DELETE_SUPPLIER_PRICE_LIST,
  EXPORT_ALL_PRICE_LIST_FILE,
  EXPORT_PRICE_LIST_FILE,
  EXPORT_PRODUCTS_FILE,
  EXPORT_PRODUCTS_STOCK_FILE,
  GET_PRODUCT_CATEGS,
  GET_SUPPLIER_PRODUCT_CATALOG,
  GET_SUPPLIER_PRODUCT_DETAILS,
  GET_SUPPLIER_PRODUCT_STOCK,
  NEW_SUPPLIER_PRODUCT,
  REORDER_SUPPLIER_PRODUCT_IMAGES,
  SEARCH_SAT_CODES,
  UPDATE_ONE_SUPPLIER_PRICE_LIST,
  UPDATE_SUPPLIER_PRICE_LIST,
  UPDATE_SUPPLIER_PRODUCT,
  UPDATE_SUPPLIER_PRODUCT_IMAGE,
  UPLOAD_BATCH_SUPPLIER_PRICE_LIST,
  UPLOAD_BATCH_SUPPLIER_PRODUCTS,
  UPLOAD_BATCH_SUPPLIER_PRODUCT_STOCK,
} from "../../queries/supplier/supplierProduct";
import { GET_SUPPLIER_PRICE_LISTS, GET_SUPPLIER_PRODUCT_DEFAULT_PRICE_LISTS } from "../../queries/supplier/supplierPriceList";
// errors
import { AlimaAPITokenError } from "../../errors";
import {
  ProductSupplierPriceListType,
  SupplierPriceListStateType,
  SupplierPriceListType,
  SupplierPriceListUploadStateType,
  SupplierStockListType,
} from "../../domain/supplier/SupplierPriceList";
import { decodeFile, fISODate } from "../../utils/helpers";
import { SupplierProductStockUploadStateType } from "../../domain/supplier/SupplierProductStock";

const initialState = {
  isLoading: false,
  inProcess: true,
  error: {
    active: false,
    body: "",
  },
  productCategories: [] as Array<{ label: string; value: string }>,
  satCodes: [] as Array<MxSatProductCodeType>,
  supplierProductDetails: {} as SupplierProductType,
  supplierProdsStock: [] as SupplierProductType[],
  supplierProdsCatalog: [] as SupplierProductType[],
  supplierPricesLists: [] as Array<SupplierPriceListType>,
  supplierUnitDefaultPricesLists: [] as Array<string>,
  AllPricesListsByProduct: [] as Array<ProductSupplierPriceListType>,
  supplierPriceListState: {
    listName: "",
    xlsxPriceListData: undefined,
    isDefault: undefined,
    resBranches: [],
    supUnitId: "",
    validUntil: undefined,
  } as SupplierPriceListUploadStateType,
  batchSupplierProdFeedback: {
    products: [] as Array<any>,
    resMsg: "" as string,
  },
  batchSupplierPriceListFeedback: {
    prices: [] as Array<any>,
    resMsg: "" as string,
  },
  batchSupplierProductStockFeedback: {
    stock: [] as Array<any>,
    resMsg: "" as string,
  },
  exportProducts: {
    loaded: false,
    file: undefined as File | undefined,
  },
  exportProductsStock: {
    loaded: false,
    file: undefined as File | undefined,
  },
  exportPriceList: {
    loaded: false,
    file: undefined as File | undefined,
  },
  exportAllPriceList: {
    loaded: false,
    file: undefined as File | undefined,
  },
};

const slice = createSlice({
  name: "supplier",
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
      state.isLoading = false;
      state.inProcess = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // ADD Product Categories
    setProductCategories(state, action) {
      state.isLoading = false;
      state.productCategories = action.payload;
    },
    // SET Product SAT Codes
    setProductSATCodes(state, action) {
      state.isLoading = false;
      state.satCodes = action.payload;
    },
    // RESET Product SAT Codes
    resetProductSATCodes(state) {
      state.isLoading = false;
      state.satCodes = [];
    },
    // SET Batch Supplier product file feedback
    setBatchSupplierProdFeedback(state, action) {
      state.isLoading = false;
      state.batchSupplierProdFeedback = action.payload;
    },
    // SET Batch Supplier price list file feedback
    setBatchSupplierPriceListFeedback(state, action) {
      state.isLoading = false;
      state.batchSupplierPriceListFeedback = action.payload;
    },
    // SET Batch Supplier price list file feedback
    setBatchSupplierProductStockFeedback(state, action) {
      state.isLoading = false;
      state.batchSupplierProductStockFeedback = action.payload;
    },
    // SET Supplier products catalog
    setSupplierProdsCatalog(state, action) {
      state.isLoading = false;
      state.supplierProdsCatalog = action.payload;
    },
    // SET Supplier product details
    setSupplierProdDetails(state, action) {
      state.isLoading = false;
      const _payload = {
        ...action.payload,
        longDescription: action.payload.longDescription || "",
      };
      if (_payload.buyUnit) {
        _payload.buyUnit = _payload.buyUnit.toLowerCase();
      }
      if (_payload.sellUnit) {
        _payload.sellUnit = _payload.sellUnit.toLowerCase();
      }
      state.supplierProductDetails = _payload;
    },
    // SET Supplier product stock
    setSupplierProdStock(state, action) {
      state.isLoading = false;
      state.supplierProdsStock = action.payload;
    },
    // RESET Supplier product details
    resetSupplierProdDetails(state) {
      state.isLoading = false;
      state.supplierProductDetails = {} as SupplierProductType;
    },
    // SET Supplier price lists
    setSupplierPriceLists(state, action) {
      state.isLoading = false;
      state.supplierPricesLists = action.payload;
    },
    setSupplierUnitDefaultPriceLists(state, action) {
      state.isLoading = false;
      state.AllPricesListsByProduct = action.payload;
    },
    resetSupplierUnitDefaultPriceLists(state) {
      state.isLoading = false;
      state.AllPricesListsByProduct = []; 
    },
    addExportProductsSuccess(state, action) {
      state.isLoading = false;
      state.exportProducts = action.payload;
    },
    addExportProductsStockSuccess(state, action) {
      state.isLoading = false;
      state.exportProductsStock = action.payload;
    },
    addExportPriceListSuccess(state, action) {
      state.isLoading = false;
      state.exportPriceList = action.payload;
    },
    addExportAllPriceListSuccess(state, action) {
      state.isLoading = false;
      state.exportAllPriceList = action.payload;
    },
    clearExportProductsSuccess(state) {
      state.isLoading = false;
      state.exportProducts = {
        loaded: false,
        file: undefined,
      };
    },
    clearExportPriceListSuccess(state) {
      state.isLoading = false;
      state.exportPriceList = {
        loaded: false,
        file: undefined,
      };
    },
    clearExportAllPriceListSuccess(state) {
      state.isLoading = false;
      state.exportAllPriceList = {
        loaded: false,
        file: undefined,
      };
    },
    clearExportProductStockSuccess(state) {
      state.isLoading = false;
      state.exportProductsStock = {
        loaded: false,
        file: undefined,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  resetState,
  resetProductSATCodes,
  resetSupplierProdDetails,
  clearExportAllPriceListSuccess,
  clearExportProductsSuccess,
  clearExportPriceListSuccess,
  clearExportProductStockSuccess,
  resetSupplierUnitDefaultPriceLists,
  setSupplierUnitDefaultPriceLists
} = slice.actions;

// ----------------------------------------------------------------------

/**
 * Get Product Categories
 * @returns
 */
export function getProductCategories() {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_PRODUCT_CATEGS,
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      // filter over unique labels
      const labels = data.getCategories.map((item: any) => item.label);
      const uniqueLabels = labels.filter(
        (item: any, index: number) => labels.indexOf(item) === index
      );
      // filter over unique values
      const values = data.getCategories.map((item: any) => item.value);
      const uniqueValues = values.filter(
        (item: any, index: number) => values.indexOf(item) === index
      );
      // create unique array
      const uniqueArray = uniqueLabels.map((item: any, index: number) => ({
        label: item,
        value: uniqueValues[index],
      }));
      // dispatch sorted categories
      dispatch(
        slice.actions.setProductCategories(
          uniqueArray.sort((a: any, b: any) => {
            if (a.label < b.label) {
              return -1;
            }
            if (b.label < a.label) {
              return 1;
            }
            return 0;
          })
        )
      );
    } catch (error: any) {
      console.warn("Issues getting Product Categories");
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
 * Search SAT Codes
 * @param string searchStr
 * @returns
 */
export function searchProductSATCodes(searchStr?: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      let _srch = null;
      if (searchStr !== undefined && searchStr !== "" && searchStr.length > 2) {
        _srch = searchStr;
      }
      const { data, error } = await graphQLFetch({
        query: SEARCH_SAT_CODES,
        variables: {
          searchStr: _srch,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getProductSATCodes ||
        data?.getProductSATCodes[0]?.code > 0
      ) {
        throw new Error("Data is undefined");
      }
      // filter over unique labels
      const uniqueArray = data.getProductSATCodes;
      // dispatch sorted sat codes
      dispatch(
        slice.actions.setProductSATCodes(
          uniqueArray.sort(
            (a: MxSatProductCodeType, b: MxSatProductCodeType) => {
              if (a.satDescription < b.satDescription) {
                return -1;
              }
              if (b.satDescription < a.satDescription) {
                return 1;
              }
              return 0;
            }
          )
        )
      );
    } catch (error: any) {
      console.warn("Issues getting SAT Codes");
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
 * Search SAT Codes
 * @param string searchStr
 * @returns
 */
export function searchEditProductSATCodes(searchStr?: string) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      let _srch = null;
      if (searchStr !== undefined && searchStr !== "" && searchStr.length > 2) {
        _srch = searchStr;
      }
      const { data, error } = await graphQLFetch({
        query: SEARCH_SAT_CODES,
        variables: {
          searchStr: _srch,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getProductSATCodes ||
        data?.getProductSATCodes[0]?.code > 0
      ) {
        throw new Error("Data is undefined");
      }
      // filter over unique labels
      const uniqueArray = data.getProductSATCodes;
      // dispatch sorted sat codes
      dispatch(
        slice.actions.setProductSATCodes(
          uniqueArray.sort(
            (a: MxSatProductCodeType, b: MxSatProductCodeType) => {
              if (a.satDescription < b.satDescription) {
                return -1;
              }
              if (b.satDescription < a.satDescription) {
                return 1;
              }
              return 0;
            }
          )
        )
      );
    } catch (error: any) {
      console.warn("Issues getting SAT Codes");
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
 * Add product to catalog
 * @param string supplierId
 * @param string token
 * @param string description
 * @param string buyUnit
 * @param number conversionFactor
 * @param number minQuantity
 * @param string sellUnit
 * @param string sku
 * @param number tax
 * @param string taxId
 * @param number unitMultiple
 * @param string productId
 * @param number defaultPrice
 * @param number estimatedWeight
 * @param string upc
 * @returns
 */
export function addSupplierProduct(
  supplierId: string,
  token: string,
  description: string,
  buyUnit: string,
  conversionFactor: number | string,
  minQuantity: number,
  sellUnit: string,
  sku: string,
  taxAmount: number,
  taxId: string,
  unitMultiple: number,
  productId?: string,
  defaultPrice?: number,
  estimatedWeight?: number,
  upc?: string,
  tags?: Array<{ tagKey: string; tagValue: string }>,
  longDescription?: string,
  iepsAmount?: number
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierId) {
        throw new Error("Supplier ID is undefined");
      }
      let _stags = null;
      if (tags !== undefined) {
        _stags = tags.map((t) => ({
          tag: t.tagKey,
          value: t.tagValue,
        }));
      }
      if (iepsAmount !== undefined) {
        iepsAmount = parseFloat(iepsAmount.toString()) / 100
      }
      else {
        iepsAmount = undefined
      }
      const { data, error } = await graphQLFetch({
        query: NEW_SUPPLIER_PRODUCT,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        variables: {
          description: description,
          buyUnit: buyUnit.toUpperCase(),
          conversionFactor: parseFloat(conversionFactor.toString()),
          minQuantity: parseFloat(minQuantity.toString()),
          sellUnit: sellUnit.toUpperCase(),
          sku: sku,
          supplierBusinessId: supplierId,
          tax: parseFloat(taxAmount.toString()) / 100,
          taxId: taxId,
          unitMultiple: parseFloat(unitMultiple.toString()),
          defaultPrice:
            defaultPrice === undefined
              ? null
              : parseFloat(defaultPrice.toString()),
          estimatedWeight:
            estimatedWeight === undefined
              ? null
              : parseFloat(estimatedWeight.toString()),
          productId: null, // [TO DO]
          upc: upc || null,
          sTags: _stags,
          longDes: longDescription,
          iepsAmount: iepsAmount,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.newSupplierProduct ||
        data?.newSupplierProduct?.code > 0
      ) {
        if (data?.newSupplierProduct?.msg === "Error adding new supplier products: Product already exists") {
          throw new Error("Product already exists");
        }
        if (data?.newSupplierProduct?.msg) {
          throw new Error(data?.newSupplierProduct?.msg);
        }
        throw new Error("Data is undefined");
      }
      const newProd = data.newSupplierProduct;
      if (newProd?.products?.length === 0) {
        throw new Error("Product is undefined");
      }
      if (newProd?.products[0].id === undefined) {
        throw new Error("Product ID is undefined");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Product");
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
 * Add product to catalog
 * @param string supplierId
 * @param string token
 * @param string description
 * @param string buyUnit
 * @param number conversionFactor
 * @param number minQuantity
 * @param string sellUnit
 * @param string sku
 * @param number tax
 * @param string taxId
 * @param number unitMultiple
 * @param string productId
 * @param number defaultPrice
 * @param number estimatedWeight
 * @param string upc
 * @returns
 */
export function editSupplierProduct(
  supplierProductId: string,
  token: string,
  description: string,
  buyUnit: string,
  conversionFactor: number | string,
  minQuantity: number,
  sellUnit: string,
  sku: string,
  taxAmount: number,
  taxId: string,
  unitMultiple: number,
  productId?: string,
  defaultPrice?: number,
  estimatedWeight?: number,
  upc?: string,
  tags?: Array<{ tagKey: string; tagValue: string }>,
  longDescription?: string,
  iepsAmount?: number
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierProductId) {
        throw new Error("Supplier Product ID is undefined");
      }
      let _stags = null;
      if (tags !== undefined) {
        _stags = tags.map((t) => ({
          tag: t.tagKey,
          value: t.tagValue,
        }));
      }
      if (iepsAmount !== undefined) {
        iepsAmount = parseFloat(iepsAmount.toString()) / 100
      }
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_PRODUCT,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        variables: {
          supplierProductId: supplierProductId,
          description: description,
          buyUnit: buyUnit.toUpperCase(),
          conversionFactor: parseFloat(conversionFactor.toString()),
          minQuantity: parseFloat(minQuantity.toString()),
          sellUnit: sellUnit.toUpperCase(),
          sku: sku,
          tax: parseFloat(taxAmount.toString()) / 100,
          taxId: taxId,
          unitMultiple: parseFloat(unitMultiple.toString()),
          defaultPrice:
            defaultPrice === undefined
              ? null
              : parseFloat(defaultPrice.toString()),
          estimatedWeight:
            estimatedWeight === undefined
              ? null
              : parseFloat(estimatedWeight.toString()),
          productId: null, // [TO DO]
          upc: upc || null,
          sTags: _stags,
          longDes: longDescription,
          iepsAmount: iepsAmount
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.editSupplierProduct ||
        data?.editSupplierProduct?.code > 0
      ) {
        if (data?.editSupplierProduct?.msg === "Product already exists") {
          throw new Error("Product already exists");
        }
        if (data?.editSupplierProduct?.msg) {
          throw new Error(data?.editSupplierProduct?.msg);
        }
        throw new Error("Data is undefined");
      }
      const newProd = data.editSupplierProduct;
      if (newProd?.products?.length === 0) {
        throw new Error("Product is undefined");
      }
      if (newProd?.products[0].id === undefined) {
        throw new Error("Product ID is undefined");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues editing Supplier Product");
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
 * Add product to catalog --> add this to supplier slice
 * @param string supplierId
 * @param string token
 * @returns
 */
export function addSupplierProducts(
  supplierId: string,
  catalog: Array<any>, // Array<SupplierProductType>,
  token: string
) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      // if (!supplierId) {
      //   throw new Error('Supplier ID is undefined');
      // }
      // if (catalog.length === 0) {
      //   throw new Error('Catalog is empty');
      // }
      // // graphql call
      // const { data, error } = await graphQLFetch({
      //   query: UPDATE_SUPPLIER_CLIENT,
      //   variables: {
      //     supId: supplierId,
      //     catalog: catalog.map((item) => ({
      //       product: {
      //         // productId: item.id, -- not used now.
      //         sku: generateUUID(),
      //         description: item.productDescription,
      //         taxId: '', // done by suppliers
      //         sellUnit: item.sellUnit.toUpperCase(),
      //         taxUnit: '', // done by suppliers
      //         tax: 0, // done by suppliers
      //         conversionFactor: 1, // done by suppliers
      //         buyUnit: item.sellUnit.toUpperCase(),
      //         unitMultiple: item.sellUnit.toUpperCase() === 'KG' ? 0.1 : 1, // done by suppliers
      //         minQuantity: item.sellUnit.toUpperCase() === 'KG' ? 0.1 : 1, // done by suppliers
      //         estimatedWeight: 1, // done by suppliers
      //         isActive: true // done by suppliers
      //       },
      //       price: item.price
      //         ? {
      //             price: item.price.amount,
      //             currency: item.price.unit,
      //             validFrom: new Date().toISOString(),
      //             validUpto: inXTime(365 * 10).toISOString() // 10 years
      //           }
      //         : null
      //     }))
      //   },
      //   headers: {
      //     Authorization: `restobasic ${token}`
      //   }
      // });
      // if (error) {
      //   throw error;
      // }
      // if (!data && !data?.updateRestaurantSupplerCreation) {
      //   throw new Error('Data is undefined');
      // }
      // const supp = data.updateRestaurantSupplerCreation;
      // dispatch(
      //   slice.actions.getSupplierProfileSuccess({
      //     id: supp.supplierBusiness.id,
      //     supplierName: supp.supplierBusiness.name,
      //     country: supp.supplierBusiness.country,
      //     notificationType: supp.supplierBusiness.notificationPreference
      //       .toString()
      //       .toLowerCase(),
      //     active: supp.supplierBusiness.active,
      //     phoneNumber: supp.supplierBusinessAccount.phoneNumber,
      //     displayName: supp.supplierBusinessAccount.displayName,
      //     email: supp.supplierBusinessAccount.email,
      //     category: supp.unit[0].category.supplierCategoryId
      //   } as SupplierProfileType)
      // );
      console.log("[TODO] - Implement add Supplier products");
    } catch (error: any) {
      console.warn("Issues adding Supplier products");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Edit product from catalog
 * @param string supplierId
 * @param string token
 * @returns
 */
export function editSupplierProducts(
  supplierId: string,
  catalog: Array<any>, //  Array<SupplierProductType>,
  token: string
) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      // if (!supplierId) {
      //   throw new Error('Supplier ID is undefined');
      // }
      // if (catalog.length === 0) {
      //   throw new Error('Catalog is empty');
      // }
      // if (catalog.map((item) => item.id).includes(undefined)) {
      //   throw new Error('Catalog has undefined items');
      // }
      // // graphql call
      // const { data, error } = await graphQLFetch({
      //   query: UPDATE_SUPPLIER_CLIENT,
      //   variables: {
      //     supId: supplierId,
      //     catalog: catalog.map((item) => ({
      //       product: {
      //         id: item.id,
      //         productId: item.productUuid,
      //         sku: item.sku,
      //         description: item.productDescription,
      //         taxId: '', // done by suppliers
      //         sellUnit: item.sellUnit.toUpperCase(),
      //         taxUnit: '', // done by suppliers
      //         tax: 0, // done by suppliers
      //         conversionFactor: 1, // done by suppliers
      //         buyUnit: item.sellUnit.toUpperCase(),
      //         unitMultiple: item.sellUnit.toUpperCase() === 'KG' ? 0.1 : 1, // done by suppliers
      //         minQuantity: item.sellUnit.toUpperCase() === 'KG' ? 0.1 : 1, // done by suppliers
      //         estimatedWeight: 1, // done by suppliers
      //         isActive: true // done by suppliers
      //       },
      //       price: item.price
      //         ? {
      //             price: item.price.amount,
      //             currency: item.price.unit,
      //             validFrom: new Date().toISOString(),
      //             validUpto: inXTime(365 * 10).toISOString() // 10 years
      //           }
      //         : null
      //     }))
      //   },
      //   headers: {
      //     Authorization: `restobasic ${token}`
      //   }
      // });
      // if (error) {
      //   throw error;
      // }
      // if (!data && !data?.updateRestaurantSupplerCreation) {
      //   throw new Error('Data is undefined');
      // }
      // const supp = data.updateRestaurantSupplerCreation;
      // dispatch(
      //   slice.actions.getSupplierProfileSuccess({
      //     id: supp.supplierBusiness.id,
      //     supplierName: supp.supplierBusiness.name,
      //     country: supp.supplierBusiness.country,
      //     notificationType: supp.supplierBusiness.notificationPreference
      //       .toString()
      //       .toLowerCase(),
      //     active: supp.supplierBusiness.active,
      //     phoneNumber: supp.supplierBusinessAccount.phoneNumber,
      //     displayName: supp.supplierBusinessAccount.displayName,
      //     email: supp.supplierBusinessAccount.email,
      //     category: supp.unit[0].category.supplierCategoryId
      //   } as SupplierProfileType)
      // );
      console.log("[TODO] - Implement edit Supplier products");
    } catch (error: any) {
      console.warn("Issues editing Supplier products");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Upload Supplier Product File
 * @param mybatchfiles { xslxProductsData: any; }
 * @param token string
 * @returns
 */
export function setBatchSupplierProductFile(
  mybatchfiles: {
    xlsxProductsData: any;
  },
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetchFiles({
        query: UPLOAD_BATCH_SUPPLIER_PRODUCTS,
        variables: {
          productfile: null,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            productfile: [mybatchfiles.xlsxProductsData, "products.xlsx"],
          },
          map: {
            productfile: ["variables.productfile"],
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.upsertSupplierProductsByFile) {
        throw new Error("Data is undefined");
      }
      if (data?.upsertSupplierProductsByFile?.code > 0) {
        throw new Error(data?.upsertSupplierProductsByFile?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierProdFeedback(
          data?.upsertSupplierProductsByFile
        )
      );
    } catch (error: any) {
      console.warn("Issues setting Batch supplier product file");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Upload Supplier Price List File
 * @param mybatchfiles SupplierPriceListUploadStateType
 * @param token string
 * @returns
 */
export function setBatchSupplierPriceListFile(
  mybatchfiles: SupplierPriceListUploadStateType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetchFiles({
        query: UPLOAD_BATCH_SUPPLIER_PRICE_LIST,
        variables: {
          ...mybatchfiles,
          validUntil: fISODate(mybatchfiles.validUntil),
          pricelistfile: null,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            pricelistfile: [mybatchfiles.xlsxPriceListData, "pricelist.xlsx"],
          },
          map: {
            pricelistfile: ["variables.pricelistfile"],
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.upsertSupplierPriceListByFile) {
        throw new Error("Data is undefined");
      }
      if (data?.upsertSupplierPriceListByFile?.code > 0) {
        throw new Error(data?.upsertSupplierPriceListByFile?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierPriceListFeedback(
          data?.upsertSupplierPriceListByFile
        )
      );
    } catch (error: any) {
      console.warn("Issues setting Batch supplier price list file");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Upload Supplier Price List File
 * @param mybatchfiles SupplierProductStockUploadStateType
 * @param token string
 * @returns
 */
export function setBatchSupplierProductStockFile(
  mybatchfiles: SupplierProductStockUploadStateType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetchFiles({
        query: UPLOAD_BATCH_SUPPLIER_PRODUCT_STOCK,
        variables: {
          ...mybatchfiles,
          productStockFile: null,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            productStockFile: [mybatchfiles.xlsxProductStockListData, "productStock.xlsx"],
          },
          map: {
            productStockFile: ["variables.productStockFile"],
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.upsertSupplierProductsStockByFile) {
        throw new Error("Data is undefined");
      }
      if (data?.upsertSupplierProductsStockByFile?.code > 0) {
        throw new Error(data?.upsertSupplierProductsStockByFile?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierProductStockFeedback(
          data?.upsertSupplierProductsStockByFile
        )
      );
    } catch (error: any) {
      console.warn("Issues setting Batch supplier price list file");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}


// ----------------------------------------------------------------------

/**
 * Get products from catalog
 * @param string token
 * @returns
 */
export function getProductCatalog(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_PRODUCT_CATALOG,
        variables: {},
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getSupplierProductsByToken ||
        data?.getSupplierProductsByToken?.code > 0
      ) {
        throw new Error("Data is undefined");
      }
      const supprds = data.getSupplierProductsByToken;

      dispatch(slice.actions.setSupplierProdsCatalog(supprds?.products || []));
    } catch (error: any) {
      console.warn("Issues getting Supplier products");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get product details
 * @param string token
 * @param string supplierProductId
 * @returns
 */
export function getProductDetails(supplierProductId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!supplierProductId) {
        throw new Error("Supplier Product ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_PRODUCT_DETAILS,
        variables: {
          spId: supplierProductId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getSupplierProduct ||
        data?.getSupplierProduct?.code > 0
      ) {
        throw new Error("Data is undefined");
      }
      const supprds = data.getSupplierProduct;
      dispatch(
        slice.actions.setSupplierProdDetails(supprds?.products?.[0] || {})
      );
    } catch (error: any) {
      console.warn("Issues getting Supplier product details");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get product details
 * @param string token
 * @param string supplierProductId
 * @returns
 */
export function getProductStock(supplierUnitId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!supplierUnitId) {
        throw new Error("Supplier Unit ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_PRODUCT_STOCK,
        variables: {
          suId: supplierUnitId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getSupplierProductsStock ||
        data?.getSupplierProductsStock?.code > 0
      ) {
        throw new Error("Data is undefined");
      }
      const supprdsStock = data.getSupplierProductsStock;
      dispatch(
        slice.actions.setSupplierProdStock(supprdsStock?.products || [])
      );
    } catch (error: any) {
      console.warn("Issues getting Supplier product details");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get price lists from supplier unit
 * @param string supplierUnitId
 * @param string token
 * @returns
 */
export function getPriceLists(supplierUnitId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!supplierUnitId) {
        throw new Error("Supplier Unit ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_PRICE_LISTS,
        variables: {
          supUnitId: supplierUnitId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getSupplierUnitPriceLists ||
        data?.getSupplierUnitPriceLists?.code > 0
      ) {
        console.warn("No price lists found");
        dispatch(slice.actions.setSupplierPriceLists([]));
        return;
      }
      const spPrLists = (data.getSupplierUnitPriceLists?.priceLists || []).map(
        (pl: any) => {
          return { ...pl, supplierUnitId: supplierUnitId };
        }
      );
      dispatch(slice.actions.setSupplierPriceLists(spPrLists));
    } catch (error: any) {
      console.warn("Issues getting Supplier price lists");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get price lists from supplier unit
 * @param string supplierUnitId
 * @param string token
 * @returns
 */
export function getUnitDefaultPriceLists(supplierProductId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!supplierProductId) {
        throw new Error("Supplier Product ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_PRODUCT_DEFAULT_PRICE_LISTS,
        variables: {
          supProdId: supplierProductId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.getSupplierProductDefaultPriceLists ||
        data?.getSupplierProductDefaultPriceLists?.code > 0
      ) {
        console.warn("No price lists found");
        dispatch(slice.actions.setSupplierUnitDefaultPriceLists([]));
        return;
      }
      const spPrLists = (data.getSupplierProductDefaultPriceLists).map(
        (pl: any) => {
          return {"unitName": pl.unit.unitName, "priceListName": pl.priceList.name, "price":pl.price.price,
            "priceListId": pl.priceList.id, "priceId": pl.price.id, "newPrice": pl.price.price, "isLoading": false} as ProductSupplierPriceListType;
        }
      );
      dispatch(slice.actions.setSupplierUnitDefaultPriceLists(spPrLists));
    } catch (error: any) {
      console.warn("Issues getting Supplier Unit Defaultprice lists");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get price lists from supplier unit
 * @param string[] supplierUnitIds
 * @param string token
 * @returns
 */
export function getAllUnitsPriceLists(
  supplierUnitIds: string[],
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      let listsCollector: any[] = [];
      for (let supplierUnitId of supplierUnitIds) {
        if (!supplierUnitId) {
          throw new Error("Supplier Unit ID is undefined");
        }
        // graphql call
        const { data, error } = await graphQLFetch({
          query: GET_SUPPLIER_PRICE_LISTS,
          variables: {
            supUnitId: supplierUnitId,
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
        });
        if (error) {
          throw error;
        }
        if (
          !data ||
          !data?.getSupplierUnitPriceLists ||
          data?.getSupplierUnitPriceLists?.code > 0
        ) {
          throw new Error("Data is undefined");
        }
        const spPrLists = (
          data.getSupplierUnitPriceLists?.priceLists || []
        ).map((pl: any) => {
          return { ...pl, supplierUnitId: supplierUnitId };
        });
        listsCollector = listsCollector.concat(spPrLists);
      }
      dispatch(slice.actions.setSupplierPriceLists(listsCollector));
    } catch (error: any) {
      console.warn("Issues getting all Supplier price lists");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add new Supplier Price List
 * @param sppListState SupplierPriceListStateType
 * @param token string
 * @returns
 */
export function createSupplierPriceList(
  sppListState: SupplierPriceListStateType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: CREATE_NEW_SUPPLIER_PRICE_LIST,
        variables: {
          ...sppListState,
          validUntil: fISODate(sppListState.validUntil),
          priceDetailsList: sppListState.pricesDetails.map((sp) => ({
            supplierProductId: sp.price.supplierProductId,
            price: sp.price.price,
          })),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.newSupplierPriceList) {
        throw new Error("Data is undefined");
      }
      if (data?.newSupplierPriceList?.code > 0) {
        console.warn(
          `${data?.newSupplierPriceList?.code} - ${data?.newSupplierPriceList?.msg}`
        );
        throw new Error(data?.newSupplierPriceList?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierPriceListFeedback(
          data?.newSupplierPriceList
        )
      );
    } catch (error: any) {
      console.warn("Issues setting supplier price list");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

/**
 * Add new Supplier Price List
 * @param spsListState SupplierStockListType
 * @param token string
 * @returns
 */
export function createSupplierStockList(
  spsListState: SupplierStockListType,
  supplierUnitIds: string[],
  token: string

) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: CREATE_NEW_SUPPLIER_STOCK_LIST,
        variables: {
          supplierProductStock: spsListState.stock.map((sps) => ({
            supplierProductId: sps.id,
            stock: sps.stock?.availability || 0,
            keepSellingWithoutStock: sps.stock?.keepSellingWithoutStock,
            active: sps.stock?.active,
            sku: sps.sku,
          })),
          supUnitIds: supplierUnitIds,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.newSupplierStockList) {
        throw new Error("Data is undefined");
      }
      if (data?.newSupplierStockList?.code > 0) {
        console.warn(
          `${data?.newSupplierStockList?.code} - ${data?.newSupplierStockList?.msg}`
        );
        throw new Error(data?.newSupplierStockList?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierProductStockFeedback(
          data?.newSupplierStockList
        )
      );
    } catch (error: any) {
      console.warn("Issues setting supplier stock list");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add new Supplier Price List
 * @param sppListState SupplierPriceListStateType
 * @param token string
 * @returns
 */
export function updateSupplierPriceList(
  sppListState: SupplierPriceListStateType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_PRICE_LIST,
        variables: {
          ...sppListState,
          validUntil: fISODate(sppListState.validUntil),
          priceDetailsList: sppListState.pricesDetails.map((sp) => ({
            supplierProductId: sp.price.supplierProductId,
            price: sp.price.price,
          })),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.editSupplierPriceList) {
        throw new Error("Data is undefined");
      }
      if (data?.editSupplierPriceList?.code > 0) {
        console.warn(
          `${data?.editSupplierPriceList?.code} - ${data?.editSupplierPriceList?.msg}`
        );
        throw new Error(data?.editSupplierPriceList?.code);
      }
      dispatch(
        slice.actions.setBatchSupplierPriceListFeedback(
          data?.editSupplierPriceList
        )
      );
    } catch (error: any) {
      console.warn("Issues updating supplier price list");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
      if (error instanceof AlimaAPITokenError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Add Supplier Product Image
 * @param token
 * @param imgFile
 * @param supplierProductId
 * @returns
 */
export function addSupplierProductImage(
  token: string,
  imgFile: any,
  supplierProductId: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierProductId) {
        throw new Error("Supplier Product ID is undefined");
      }
      const { data, error } = await graphQLFetchFiles({
        query: ADD_SUPPLIER_PRODUCT_IMAGE,
        variables: {
          imgFile: null,
          supProdId: supplierProductId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            imgFile: [imgFile, imgFile.name],
          },
          map: {
            imgFile: ["variables.imgFile"],
          },
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.newSupplierProductImage ||
        data?.newSupplierProductImage?.code > 0
      ) {
        console.warn(
          data?.newSupplierProductImage?.msg ||
          "Error adding Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const newProdImg = data.newSupplierProductImage;
      if (!newProdImg?.id) {
        throw new Error("Image ID was not generated");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Product image");
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
 * Edit Supplier Product Image
 * @param token
 * @param imgFile
 * @param supplierProductImageId
 * @returns
 */
export function updateSupplierProductImage(
  token: string,
  imgFile: any,
  supplierProductImageId: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierProductImageId) {
        throw new Error("Supplier Product Image ID is undefined");
      }
      const { data, error } = await graphQLFetchFiles({
        query: UPDATE_SUPPLIER_PRODUCT_IMAGE,
        variables: {
          imgFile: null,
          imgId: supplierProductImageId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            imgFile: [imgFile, imgFile.name],
          },
          map: {
            imgFile: ["variables.imgFile"],
          },
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.editSupplierProductImage ||
        data?.editSupplierProductImage?.code > 0
      ) {
        console.warn(
          data?.editSupplierProductImage?.msg ||
          "Error updating Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const updProdImg = data.editSupplierProductImage;
      if (!updProdImg?.id) {
        throw new Error("Image ID was not updated");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues updating Supplier Product image");
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
 * Delete Supplier Product Image
 * @param token
 * @param supplierProductImageId
 * @returns
 */
export function deleteSupplierProductImage(
  token: string,
  supplierProductImageId: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierProductImageId) {
        throw new Error("Supplier Product Image ID is undefined");
      }
      const { data, error } = await graphQLFetch({
        query: DELETE_SUPPLIER_PRODUCT_IMAGE,
        variables: {
          imgId: supplierProductImageId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.deleteSupplierProductImage ||
        data?.deleteSupplierProductImage?.code > 0
      ) {
        console.warn(
          data?.deleteSupplierProductImage?.msg ||
          "Error updating Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const deletedImg = data.deleteSupplierProductImage;
      if (!deletedImg?.status) {
        throw new Error("Image ID was not deleted");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues deleting Supplier Product image");
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
 * Reorganize Supplier Product Images
 * @param token
 * @param supplierProductId
 * @param supplierProductImages
 * @returns
 */
export function reorderSupplierProductImages(
  token: string,
  supplierProductId: string,
  supplierProductImages: Array<{ id: string; priority: number }>
) {
  return async (dispatch: any) => {
    try {
      // data validation
      if (!supplierProductId) {
        throw new Error("Supplier Product ID is undefined");
      }
      if (supplierProductImages.length === 0) {
        throw new Error("Supplier Product Images are empty");
      }
      const { data, error } = await graphQLFetch({
        query: REORDER_SUPPLIER_PRODUCT_IMAGES,
        variables: {
          supProdId: supplierProductId,
          imgs: supplierProductImages,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.reorganizeSupplierProductImage ||
        data?.reorganizeSupplierProductImage?.[0]?.code > 0
      ) {
        console.warn(
          data?.reorganizeSupplierProductImage?.[0]?.msg ||
          "Error reorganizing Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const reordsImgs = data.reorganizeSupplierProductImage;
      if (reordsImgs.length === 0) {
        throw new Error("No images were organized");
      }
      // dispatch
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues reorganizing Supplier Product image");
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
 * Export historic facturas orden details
 * @param exportFormat string
 * @param business_id string
 * @param token string
 * @returns
 */
export function exportProductsFile(
  exportFormat: string,
  token: string,
  receiver?: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_PRODUCTS_FILE,
        variables: {
          xformat: exportFormat,
          type: "products",
          receiver: receiver || null,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportProductsFile) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportProductsFile.code &&
        data?.exportProductsFile.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar los productos.");
      }
      const exportProd = data.exportProductsFile;
      const jData = JSON.parse(exportProd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportProductsSuccess({
          loaded: true,
          file: xfile,
        })
      );
      console.log("fer")
    } catch (error: any) {
      console.warn("Issues exporting prices");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportProductsSuccess({
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
 * @param business_unit string
 * @param token string
 * @returns
 */
export function exportProductsStockFile(
  exportFormat: string,
  supplierUnitId: string,
  token: string,
  receiver?: string
) {
  return async (dispatch: any) => {
    try {
      if (!supplierUnitId) {
        console.warn("Supplier Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_PRODUCTS_STOCK_FILE,
        variables: {
          xformat: exportFormat,
          type: "stock",
          supplierUnitId: supplierUnitId,
          receiver: receiver || null,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportProductsFile) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportProductsFile.code &&
        data?.exportProductsFile.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar lo el inventario de productos.");
      }
      const exportStockProd = data.exportProductsFile;
      const jData = JSON.parse(exportStockProd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportProductsStockSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting stock");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportProductsStockSuccess({
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
 * @param unit_id string
 * @param token string
 * @returns
 */
export function exportAllPriceListFile(
  exportFormat: string,
  unit_id: string,
  token: string,
) {
  return async (dispatch: any) => {
    try {
      if (!unit_id) {
        console.warn("Unit Id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_ALL_PRICE_LIST_FILE,
        variables: {
          xformat: exportFormat,
          suId: unit_id,
          type: "all_product_price_lists",
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportProductsFile) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportProductsFile.code &&
        data?.exportProductsFile.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar las listas de precios");
      }
      const exportProd = data.exportProductsFile;
      const jData = JSON.parse(exportProd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportAllPriceListSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting price lists");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportAllPriceListSuccess({
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
 * @param unit_id string
 * @param price_list_id string
 * @param token string
 * @returns
 */
export function exportPriceListFile(
  exportFormat: string,
  unit_id: string,
  price_list_id: string,
  token: string,
) {
  return async (dispatch: any) => {
    try {
      if (!unit_id) {
        console.warn("Unit Id is undefined");
        return;
      }
      if (!price_list_id) {
        console.warn("price_list_id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_PRICE_LIST_FILE,
        variables: {
          xformat: exportFormat,
          suId: unit_id,
          priceListId: price_list_id,
          type: "product_price_list",
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportProductsFile) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportProductsFile.code &&
        data?.exportProductsFile.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar la lista de precios.");
      }
      const exportProd = data.exportProductsFile;
      const jData = JSON.parse(exportProd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportPriceListSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting price list");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportPriceListSuccess({
          loaded: true,
          file: undefined,
        })
      );
      throw new Error(error.toString());
    }
  };
}

export function deletePriceList(
  priceListId: string,
  unitId: string,
  token: string,
) {
  return async (dispatch: any) => {
    try {
      if (!priceListId) {
        console.warn("price_list_id is undefined");
        return;
      }
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: DELETE_SUPPLIER_PRICE_LIST,
        variables: {
          priceListId: priceListId,
          unitId: unitId
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.deleteSupplierPriceList) {
        throw new Error("Data is undefined");
      }
      if (
        data?.deleteSupplierPriceList.code &&
        data?.deleteSupplierPriceList.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo eliminar la lista de precios.");
      }

      // set file to be downloaded
      dispatch(
        slice.actions.finishProcess()
      );
    } catch (error: any) {
      console.warn("Issues exporting price list");
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

export function updateOneProductPriceList(
  priceListId: string,
  priceId: string,
  price: number,
  token: string,
  priceLists: Array<ProductSupplierPriceListType>
) {
  return async (dispatch: any) => {
    try {
      if (!priceListId) {
        console.warn("priceListId is undefined");
        return;
      }
      if (!priceId) {
        console.warn("priceId is undefined");
        return;
      }
      const UpdatedAllPricesListsByProductLoading = priceLists.map((priceList) =>
        priceList.priceListId === priceListId ?
          { ...priceList, isLoading: true } : {...priceList, isLoading: true}
      )
      dispatch(slice.actions.setSupplierUnitDefaultPriceLists(UpdatedAllPricesListsByProductLoading));
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: UPDATE_ONE_SUPPLIER_PRICE_LIST,
        variables: {
          priceListId: priceListId,
          priceId: priceId,
          price: price
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.editProductSupplierPriceList) {
        const UpdatedAllPricesListsByProduct = UpdatedAllPricesListsByProductLoading.map((priceList) =>
        priceList.priceListId === priceListId ?
          { ...priceList, isLoading: false } : {...priceList, isLoading: false}
        )
        dispatch(slice.actions.setSupplierUnitDefaultPriceLists(UpdatedAllPricesListsByProduct));
        throw new Error("Data is undefined");
      }
      if (
        data?.editProductSupplierPriceList.code &&
        data?.editProductSupplierPriceList.code > 0
      ) {
        const UpdatedAllPricesListsByProduct = UpdatedAllPricesListsByProductLoading.map((priceList) =>
        priceList.priceListId === priceListId ?
          { ...priceList, isLoading: false } : {...priceList, isLoading: false}
        )
        dispatch(slice.actions.setSupplierUnitDefaultPriceLists(UpdatedAllPricesListsByProduct));
        throw new Error("Hubo un error, no se pudo editar el precios.");
      }
      const UpdatedAllPricesListsByProduct = UpdatedAllPricesListsByProductLoading.map((priceList) =>
      priceList.priceListId === priceListId ?
        { ...priceList, isLoading: false, price:price } : {...priceList, isLoading: false}
      )
      dispatch(slice.actions.setSupplierUnitDefaultPriceLists(UpdatedAllPricesListsByProduct));
      // set file to be downloaded
    } catch (error: any) {
      console.warn("Issues exporting price list");
      throw new Error(error.toString());
    }
  };
}