// redux
import { createSlice } from "@reduxjs/toolkit";
// domain
import {
  ClientBranchType,
  ClientProfileType,
} from "../../domain/client/Client";
import {
  GET_ACTIVE_CLIENTS,
  GET_CLIENT_CATEGS,
  GET_CLIENT_PROFILE,
  NEW_SUPPLIER_CLIENT,
  UPDATE_SUPPLIER_CLIENT,
  UPSERT_CLIENT_TAX,
  UPSERT_ASSIGNED_SUPPLIER_RESTAURANT,
  NEW_ECOMMERCE_CLIENT,
  EDIT_ECOMMERCE_CLIENT,
  UPDATE_TAGS_CLIENT,
  EXPORT_CLIENTS_FILE,
} from "../../queries/client/client";
import { graphQLFetch } from "../../utils/graphql";
import { GQLError, decodeGQLErrorType } from "../../errors";
import { SupplierProductType } from "../../domain/supplier/SupplierProduct";
import { decodeFile } from "../../utils/helpers";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  inProcess: true,
  error: {
    active: false,
    body: "",
  },
  // clients: [] as Array<any>,
  batchClientFeedback: {
    clients: [] as Array<any>,
    resMsg: "" as string,
  },
  batchFiles: {
    xslxClientsData: {},
  },
  invoiceFiles: {
    pdfData: {},
    xmlData: {},
  },
  activeClients: [] as Array<ClientBranchType>,
  activeFilters: {
    search: "",
    deliveryType: [],
  },
  clientCategories: [] as Array<{ label: string; value: string }>,
  clientProfile: {} as
    | (ClientProfileType & { products: SupplierProductType[] })
    | undefined,
  clientToOrden: {} as
    | (ClientProfileType & { products: SupplierProductType[] })
    | undefined,
  clientProfileNotFound: false,
  marketplaceFilters: {
    search: "",
    deliveryType: [],
    category: [],
    paymentMethod: [],
    closingTime: [],
  },
  ecommerceTemporalPassword: undefined,
  exportclients: {
    loaded: false,
    file: undefined as File | undefined,
  },
};

const slice = createSlice({
  name: "client",
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
    // ADD Batch Files
    addBatchFilesSuccess(state, action) {
      state.isLoading = false;
      state.batchFiles = action.payload;
    },
    // SET Batch client files feedback
    setBatchClientFeedback(state, action) {
      state.isLoading = false;
      state.batchClientFeedback = action.payload;
    },
    // ADD Client
    addClientSuccess(state, action) {
      state.isLoading = false;
      state.activeClients.push(action.payload);
    },
    // ADD Client categories
    setClientCategoriesSuccess(state, action) {
      state.isLoading = false;
      state.clientCategories = action.payload;
    },
    // ADD Invoice Files
    addInvoiceFiles(state, action) {
      state.isLoading = false;
      state.invoiceFiles = action.payload;
    },
    // SET Active Clients
    addActiveClientsSuccess(state, action) {
      state.isLoading = false;
      state.activeClients = action.payload;
    },
    // SET Active Filters
    addActiveFiltersSuccess(state, action) {
      state.isLoading = false;
      state.activeFilters = action.payload;
    },
    // SET Active Search
    addActiveSearchSuccess(state, action) {
      state.isLoading = false;
      state.activeFilters.search = action.payload;
    },
    // GET Client profile
    getClientProfileSuccess(state, action) {
      state.isLoading = false;
      state.clientProfileNotFound = false;
      state.clientProfile = action.payload;
    },
    // GET Client profile
    resetClientProfileSuccess(state) {
      state.isLoading = false;
      state.clientProfile = {} as
        | (ClientProfileType & { products: SupplierProductType[] })
        | undefined;
    },
    // GET Client profile to Orden to
    getClientProfileToOrdenSuccess(state, action) {
      state.isLoading = false;
      state.clientProfileNotFound = false;
      state.clientToOrden = action.payload;
    },
    clearClientToOrden(state) {
      state.isLoading = false;
      state.clientToOrden = {} as
        | (ClientProfileType & { products: SupplierProductType[] })
        | undefined;
    },
    // SET Client profile not found
    setClientProfileNotFound(state, action) {
      state.isLoading = false;
      state.clientProfileNotFound = action.payload;
    },
    setEcommerceClientTemporalPassword(state, action) {
      state.isLoading = false;
      state.ecommerceTemporalPassword = action.payload;
    },
    resetEcommerceClientTemporalPassword(state) {
      state.ecommerceTemporalPassword = undefined;
    },
    addExportClientsSuccess(state, action) {
      state.isLoading = false;
      state.exportclients = action.payload;
    },
    clearExportClientsSuccess(state) {
      state.isLoading = false;
      state.exportclients = {
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
  clearClientToOrden,
  resetClientProfileSuccess,
  resetEcommerceClientTemporalPassword,
  clearExportClientsSuccess
} = slice.actions;

// ----------------------------------------------------------------------

/**
 * Upload Client Files
 * @param mybatchfiles { xlsxClientsData: any; }
 * @param unitId string
 * @param token string
 * @returns
 */
export function setBatchClientFiles(
  mybatchfiles: {
    xlsxClientsData: any;
  },
  unitId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      // if (!branchId) {
      //   throw new Error('Branch ID is undefined');
      // }
      // const { data, error } = await graphQLFetchFiles({
      //   query: UPLOAD_BATCH_CLIENTS,
      //   variables: {
      //     restaurantBranchId: branchId,
      //     productsfile: null,
      //     supplierFile: null
      //   },
      //   headers: {
      //     Authorization: `supplybasic ${token}`
      //   },
      //   files: {
      //     files: {
      //       supplierFile: [mybatchfiles.xlsxSuppliersData, 'suppliers.xlsx'],
      //       productsfile: [mybatchfiles.xlsxProductsData, 'products.xlsx']
      //     },
      //     map: {
      //       productsfile: ['variables.productsfile'],
      //       supplierFile: ['variables.supplierFile']
      //     }
      //   }
      // });
      // if (error) {
      //   throw error;
      // }
      // if (!data && !data?.newSupplierFile) {
      //   throw new Error('Data is undefined');
      // }
      // if (data?.newSupplierFile?.code > 0) {
      //   throw new Error(data?.newSupplierFile?.code);
      // }
      // dispatch(slice.actions.setBatchSupplierFeedback(data?.newSupplierFile));
      console.log("[TODO] - Implement setBatchClientFiles");
    } catch (error: any) {
      console.warn("Issues setting Batch client files");
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
 * Add client
 * @param client ClientProfileType
 * @param unitId string
 * @param token string
 * @returns
 */
export function addClient(
  client: ClientProfileType,
  unitId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!unitId) {
        throw new Error("Unit ID is undefined");
      }
      let _stags = null;
      if (client.tags !== undefined) {
        _stags = client.tags.map((t) => ({
          tag: t.tagKey,
          value: t.tagValue,
        }));
      }
      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: NEW_SUPPLIER_CLIENT,
        variables: {
          supUnitId: unitId,
          name: client.branchName,
          contactName: client.displayName,
          email: client.email,
          phoneNumber: "52" + client.phoneNumber?.toString(),
          country: "México", // [TODO] Hard coded for now
          street: client.street,
          extN: client.externalNum,
          intN: client.internalNum || "",
          neigh: client.neighborhood,
          city: client.city,
          estate: client.estate,
          zipCode: client.zipCode,
          fAddress: `${client.street} ${client.externalNum}${
            client.internalNum ? " " + client.internalNum : ""
          }, ${client.neighborhood}, ${client.city}, ${client.estate}, ${
            client.country
          }, C.P. ${client.zipCode}`,
          rTags: _stags,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.newSupplierRestaurantCreation) {
        throw new Error("Data is undefined");
      }
      // api call - add branch tax info
      let taxData: any = {};
      if (
        client.taxId &&
        client.taxName &&
        client.taxAddress &&
        client.taxZipCode &&
        client.invoiceEmail &&
        client.cfdiUse &&
        client.fiscalRegime &&
        client.invoicePaymentMethod &&
        client.invoicingTrigger
      ) {
        const { data: dataTax, error: errorTax } = await graphQLFetch({
          query: UPSERT_CLIENT_TAX,
          variables: {
            branchId:
              data.newSupplierRestaurantCreation.relation.restaurantBranchId,
            RFC: client.taxId,
            lName: client.taxName.trim(),
            taxAddress: client.taxAddress,
            taxZip: client.taxZipCode,
            taxEmail: client.invoiceEmail,
            cfdi: client.cfdiUse,
            satReg: "REG_" + client.fiscalRegime.toString(),
            invoicePayType: client.invoicePaymentMethod,
            invoiceTriggerType: client.invoicingTrigger,
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
        });
        if (errorTax) {
          throw errorTax;
        }
        if (!dataTax && !dataTax.upsertSupplierRestaurantTaxInfo) {
          throw new Error("Data is undefined");
        }
        taxData = { ...dataTax.upsertSupplierRestaurantTaxInfo };
        console.log("tax data", taxData);
      }
      const rest = data.newSupplierRestaurantCreation;
      if (rest?.relation?.id) {
        dispatch(slice.actions.resetClientProfileSuccess());
        dispatch(slice.actions.finishProcess());
      } else {
        throw new GQLError(
          `Issues adding Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues adding client");
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

/**
 * Add Eccomerce client
 * @param restaurantBranchId string
 * @param email string
 * @param token string
 * @returns
 */
export function addEcommerceClient(
  client: ClientProfileType,
  email: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!client.id) {
        throw new Error("restaurantBusinessId is undefined");
      }

      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: NEW_ECOMMERCE_CLIENT,
        variables: {
          restaurantBranchId: client.id,
          email: email,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.newEcommerceRestaurantUser) {
        throw new Error("Data is undefined");
      }
      const rest = data.newEcommerceRestaurantUser;
      if (rest?.id) {
        dispatch(
          slice.actions.setEcommerceClientTemporalPassword(rest.password)
        );
      } else {
        throw new GQLError(
          `Issues adding eccomerce Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues adding ecommerce client");
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

/**
 * edit ecommerce client
 * @param client ClientProfileType
 * @param email string
 * @param token string
 * @returns
 */
export function editEcommerceClient(
  client: ClientProfileType,
  email: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!client.id) {
        throw new Error("restaurantBusinessId is undefined");
      }

      dispatch(slice.actions.startLoading());
      // graphql call
      const { data, error } = await graphQLFetch({
        query: EDIT_ECOMMERCE_CLIENT,
        variables: {
          restaurantBranchId: client.id,
          email: email,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.editEcommerceRestaurantUser) {
        throw new Error("Data is undefined");
      }
      const rest = data.editEcommerceRestaurantUser;
      if (rest?.id) {
        dispatch(slice.actions.finishProcess());
        // LOADING FETCH
      } else {
        throw new GQLError(
          `Issues edit eccomerce Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues edit ecommerce client");
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
 * Edit client
 * @param client ClientProfileType
 * @param token string
 * @returns
 */
export function editClient(
  client: ClientProfileType,
  unitId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!unitId) {
        throw new Error("Supplier Unit ID is undefined");
      }
      let _stags = null;
      if (client.tags !== undefined) {
        _stags = client.tags.map((t) => ({
          tag: t.tagKey,
          value: t.tagValue,
        }));
      }
      if (client.id === undefined) {
        throw new Error("Client ID is undefined");
      }
      // graphql call
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_CLIENT,
        variables: {
          supUnitId: unitId,
          branchId: client.id,
          srRelId: client.business?.relationId,
          name: client.branchName,
          contactName: client.displayName,
          email: client.email,
          phoneNumber: "52" + client.phoneNumber?.toString(),
          country: "México", // [TODO] Hard coded for now
          street: client.street,
          extN: client.externalNum,
          intN: client.internalNum,
          neigh: client.neighborhood,
          city: client.city,
          estate: client.estate,
          zipCode: client.zipCode,
          fAddress: `${client.street} ${client.externalNum}${
            client.internalNum ? " " + client.internalNum : ""
          }, ${client.neighborhood}, ${client.city}, ${client.estate}, ${
            client.country
          }, C.P. ${client.zipCode}`,
          rTags: _stags,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateSupplerRestaurant) {
        throw new Error("Data is undefined");
      }
      // api call - add branch tax info
      let taxData: any = {};
      if (
        client.taxId &&
        client.taxName &&
        client.taxAddress &&
        client.taxZipCode &&
        client.invoiceEmail &&
        client.cfdiUse &&
        client.fiscalRegime
      ) {
        const { data: dataTax, error: errorTax } = await graphQLFetch({
          query: UPSERT_CLIENT_TAX,
          variables: {
            branchId: data.updateSupplerRestaurant.relation.restaurantBranchId,
            RFC: client.taxId,
            lName: client.taxName.trim(),
            taxAddress: client.taxAddress,
            taxZip: client.taxZipCode,
            taxEmail: client.invoiceEmail,
            invoicePayType: client.invoicePaymentMethod,
            invoiceTriggerType: client.invoicingTrigger,
            cfdi: client.cfdiUse,
            satReg: "REG_" + client.fiscalRegime.toString(),
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
        });
        if (errorTax) {
          throw errorTax;
        }
        if (!dataTax && !dataTax.upsertSupplierRestaurantTaxInfo) {
          throw new Error("Data is undefined");
        }
        taxData = { ...dataTax.upsertSupplierRestaurantTaxInfo };
        console.log("tax data", taxData);
      }
      const rest = data.updateSupplerRestaurant;
      if (rest?.relation?.id) {
        dispatch(slice.actions.resetClientProfileSuccess());
        dispatch(slice.actions.finishProcess());
      } else {
        throw new GQLError(
          `Issues editing Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues editing client");
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

/**
 * Edit client
 * @param client ClientProfileType
 * @param token string
 * @returns
 */
export function editTagsClient(
  client: ClientProfileType,
  unitId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!unitId) {
        throw new Error("Supplier Unit ID is undefined");
      }
      let _stags = null;
      if (client.tags !== undefined) {
        _stags = client.tags.map((t) => ({
          tag: t.tagKey,
          value: t.tagValue,
        }));
      }
      if (client.id === undefined) {
        throw new Error("Client ID is undefined");
      }
      // graphql call
      const { data, error } = await graphQLFetch({
        query: UPDATE_TAGS_CLIENT,
        variables: {
          supUnitId: unitId,
          branchId: client.id,
          srRelId: client.business?.relationId,
          rTags: _stags,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateSupplerRestaurant) {
        throw new Error("Data is undefined");
      }
      const rest = data.updateSupplerRestaurant;
      if (rest?.relation?.id) {
        dispatch(slice.actions.resetClientProfileSuccess());
        dispatch(slice.actions.finishProcess());
      } else {
        throw new GQLError(
          `Issues editing Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues editing client");
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

/**
 * Edit client
 * @param unitId string
 * @param branchId string
 * @param token string
 * @returns
 */
export function upsertAssignedSupplierRestaurant(
  unitId: string | undefined,
  branchId: string | undefined,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      if (!unitId) {
        throw new Error("Supplier Unit ID is undefined");
      }
      if (!branchId) {
        throw new Error("Branch ID is undefined");
      }

      // graphql call
      const { data, error } = await graphQLFetch({
        query: UPSERT_ASSIGNED_SUPPLIER_RESTAURANT,
        variables: {
          restaurantBranchId: branchId,
          setSupplierUnitId: unitId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.updateSupplerRestaurant) {
        throw new Error("Data is undefined");
      }
      const rest = data.upsertAssignedSupplierRestaurant;
      if (rest?.id) {
        dispatch(slice.actions.finishProcess());
      } else {
        throw new GQLError(
          `Issues assigning Client ${rest?.code}`,
          decodeGQLErrorType(rest?.code)
        );
      }
    } catch (error: any) {
      console.warn("Issues assigning client");
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
 * Get Client Categories
 * @returns
 */
export function getClientCategories() {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_CLIENT_CATEGS,
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getCategories && data?.getCategories.length === 0) {
        throw new Error("Data is undefined");
      }
      if (data?.getCategories[0]?.code > 0) {
        dispatch(slice.actions.setClientCategoriesSuccess([]));
        throw new Error("No hay categorías disponibles");
      }

      // dispatch sorted categories
      dispatch(
        slice.actions.setClientCategoriesSuccess(
          data.getCategories.sort((a: any, b: any) => {
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
      console.warn("Issues getting Client Categories");
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
 * Add Invoice Files
 * @param myInvoiceFiles
 * @param ordenId: string
 * @returns
 */
export function setInvoiceFiles(
  myInvoiceFiles: {
    pdfData: any;
    xmlData: any;
  },
  ordenId: string
) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      // if (!ordenId) {
      //   throw new Error('Orden ID is undefined');
      // }
      // const { data, error } = await graphQLFetchFiles({
      //   query: UPLOAD_INVOICE_FILES,
      //   variables: {
      //     ordenId: ordenId,
      //     pdf: null,
      //     xml: null
      //   },
      //   files: {
      //     files: {
      //       pdf: [myInvoiceFiles.pdfData, 'invoice.pdf'],
      //       xml: [myInvoiceFiles.xmlData, 'invoice.xml']
      //     },
      //     map: {
      //       pdf: ['variables.pdf'],
      //       xml: ['variables.xml']
      //     }
      //   }
      // });
      // if (error) {
      //   throw error;
      // }
      // if (!data && !data?.uploadInvoice) {
      //   throw new Error('Data is undefined');
      // }
      // if (data?.uploadInvoice?.code > 0) {
      //   throw new Error(data?.uploadInvoice?.code);
      // }
      // if (data?.uploadInvoice?.success) {
      //   dispatch(slice.actions.addInvoiceFiles(myInvoiceFiles));
      // } else {
      //   throw new Error(data?.uploadInvoice?.msg);
      // }
      console.log("[TODO] - Implement setInvoiceFiles");
    } catch (error: any) {
      console.warn("Issues setting Invoice files");
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
 * Get active clients
 * @param sUnitIds string[]
 * @param token string
 * @returns
 */
export function getActiveClients(sUnitIds: string[], token: string) {
  return async (dispatch: any) => {
    try {
      if (!sUnitIds || sUnitIds.length === 0) {
        throw new Error("Supplier Unit IDs is undefined");
      }
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ACTIVE_CLIENTS,
        variables: {
          supUnitIds: sUnitIds,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.getSupplierRestaurants) {
        throw new Error("Data is undefined");
      }
      if (data?.getSupplierRestaurants[0]?.code > 0) {
        dispatch(slice.actions.addActiveClientsSuccess([]));
        console.warn("No active clients");
        return;
      }
      // dispatch sorted suppliers
      dispatch(
        slice.actions.addActiveClientsSuccess(
          data.getSupplierRestaurants
            .sort((a: any, b: any) => {
              if (a.name < b.name) {
                return -1;
              }
              if (b.name < a.name) {
                return 1;
              }
              return 0;
            })
            .map((supRes: any) => {
              const resAcc = supRes.restaurantBusinessAccount;
              const branch = supRes.branch.restaurantBranch;
              const branchCateg = supRes.branch.category;
              return {
                ...branch,
                clientCategory: branchCateg.restaurantCategoryId,
                displayName: supRes.restaurantBusiness.name,
                email: resAcc.email,
                phoneNumber: resAcc.phoneNumber,
                business: {
                  clientName: supRes.restaurantBusiness.name,
                  id: supRes.restaurantBusiness.id,
                  active: supRes.restaurantBusiness.active,
                  assignedUnit: supRes.relation.supplierUnitId,
                },
                taxId: supRes.branch.taxInfo?.taxId || "",
              } as ClientProfileType;
            })
        )
      );
    } catch (error: any) {
      console.warn("Issues setting active clients");
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
 * Set active filters
 * @param filters
 * @returns
 */
export function setActiveFilters(filters: any) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveFiltersSuccess(filters));
    } catch (error) {
      console.warn("Issues setting active filters");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Set active search
 * @param search
 * @returns
 */
export function setActiveSearch(search: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.addActiveSearchSuccess(search));
    } catch (error) {
      console.warn("Issues setting active search");
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error,
        })
      );
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Get client profile
 *  @param supplierUnitId string
 *  @param clientId string
 *  @param token string
 * @returns
 */
export function getClientProfile(
  supplierUnitId: string,
  clientId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!supplierUnitId || !clientId) {
        throw new Error("Supplier Unit ID or Client ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_CLIENT_PROFILE,
        variables: {
          supUnitId: supplierUnitId,
          branchId: clientId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        dispatch(slice.actions.setClientProfileNotFound(true));
        return;
      }
      if (
        !data ||
        !data?.getSupplierRestaurantProducts ||
        data?.getSupplierRestaurantProducts.code
      ) {
        dispatch(slice.actions.setClientProfileNotFound(true));
        return;
      }
      const supResOpt = data.getSupplierRestaurantProducts;
      const resAcc = supResOpt.restaurantBusinessAccount;
      const branch = supResOpt.branch.restaurantBranch;
      const branchCateg = supResOpt.branch.category;
      const taxData = supResOpt.branch.taxInfo;
      const ecommerceUser = supResOpt.ecommerceUser;
      const invOpt = data.getSupplierRestaurantProducts.branch.invoicingOptions;
      let invTrigger: string = "deactivated";
      if (invOpt) {
        if (invOpt?.triggeredAt === "AT_PURCHASE") {
          invTrigger = "at_purchase";
        } else if (invOpt?.triggeredAt === "AT_DELIVERY") {
          invTrigger = "at_delivery";
        }
      }
      const supProds = supResOpt.products.map((p: any) => ({
        ...p.product,
        price: p.lastPrice,
      }));
      // dispatch sorted suppliers
      dispatch(
        slice.actions.getClientProfileSuccess({
          ...branch,
          clientCategory: branchCateg.restaurantCategoryId,
          displayName: resAcc.contactName,
          email: resAcc.email,
          phoneNumber:
            resAcc.phoneNumber.length === 12
              ? resAcc.phoneNumber.slice(2)
              : resAcc.phoneNumber,
          business: {
            clientName: supResOpt.restaurantBusiness.name,
            id: supResOpt.restaurantBusiness.id,
            active: supResOpt.restaurantBusiness.active,
            assignedUnit: supResOpt.relation.supplierUnitId,
            relationId: supResOpt.relation.id,
          },
          // fetch this from tax info
          cfdiUse: taxData?.cfdiUse || "",
          fiscalRegime:
            taxData?.fiscalRegime?.toString().replace("REG_", "") || "",
          taxId: taxData?.taxId || "",
          taxName: taxData?.taxName || "",
          taxAddress: taxData?.taxAddress || "",
          taxZipCode: taxData?.taxZipCode || "",
          invoiceEmail: taxData?.invoiceEmail || "",
          products: supProds,
          invoicingTrigger: invTrigger,
          invoicePaymentMethod: invOpt?.invoiceType,
          tags: supResOpt.branch.tags,
          ecommerceUser: {
            id: ecommerceUser?.id || "",
            password: ecommerceUser?.password || "",
            disabled: ecommerceUser?.disabled || "",
            firstName: ecommerceUser?.firstName || "",
            lastName: ecommerceUser?.lastName || "",
            phoneNumber: ecommerceUser?.phoneNumber || "",
            email: ecommerceUser?.email || "",
          },
        } as ClientProfileType & { products: SupplierProductType[] })
      );
    } catch (error: any) {
      console.warn("Issues getting client profile");
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
 * Get client profile To Orden
 * @param supplierUnitId string
 *  @param clientId string
 *  @param token string
 * @returns
 */
export function getClientProfileToOrden(
  supplierUnitId: string,
  clientId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_CLIENT_PROFILE,
        variables: {
          supUnitId: supplierUnitId,
          branchId: clientId,
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
        !data?.getSupplierRestaurantProducts ||
        data?.getSupplierRestaurantProducts.code
      ) {
        throw new Error("Data is undefined");
      }
      const supResOpt = data.getSupplierRestaurantProducts;
      const resAcc = supResOpt.restaurantBusinessAccount;
      const branch = supResOpt.branch.restaurantBranch;
      const branchCateg = supResOpt.branch.category;
      const taxData = supResOpt.branch.taxInfo;
      const invOpt = data.getSupplierRestaurantProducts.branch.invoicingOptions;
      let invTrigger: string = "deactivated";
      if (invOpt) {
        if (invOpt?.triggeredAt === "AT_PURCHASE") {
          invTrigger = "at_purchase";
        } else if (invOpt?.triggeredAt === "AT_DELIVERY") {
          invTrigger = "at_delivery";
        }
      }
      const supProds = supResOpt.products.map((p: any) => ({
        ...p,
        minimumQuantity: p.minQuantity,
        price: p.lastPrice,
      }));
      // dispatch sorted suppliers
      dispatch(
        slice.actions.getClientProfileToOrdenSuccess({
          ...branch,
          clientCategory: branchCateg.restaurantCategoryId,
          displayName: resAcc.contactName,
          email: resAcc.email,
          phoneNumber:
            (resAcc.phoneNumber || "5555555555").length === 12
              ? resAcc.phoneNumber.slice(2)
              : resAcc.phoneNumber,
          business: {
            clientName: supResOpt.restaurantBusiness.name,
            id: supResOpt.restaurantBusiness.id,
            active: supResOpt.restaurantBusiness.active,
            assignedUnit: supResOpt.relation.supplierUnitId,
            relationId: supResOpt.relation.id,
          },
          // fetch this from tax info
          cfdiUse: taxData?.cfdiUse || "",
          fiscalRegime:
            taxData?.fiscalRegime?.toString().replace("REG_", "") || "",
          taxId: taxData?.taxId || "",
          taxName: taxData?.taxName || "",
          taxAddress: taxData?.taxAddress || "",
          taxZipCode: taxData?.taxZipCode || "",
          invoiceEmail: taxData?.invoiceEmail || "",
          invoicingTrigger: invTrigger,
          invoicePaymentMethod: invOpt?.invoiceType,
          products: supProds,
        } as ClientProfileType & { products: SupplierProductType[] })
      );
    } catch (error: any) {
      console.warn("Issues getting client profile to orden");
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

/**
 * Get clients to export
 * @param exportFormat string
 * @param token string
 * @returns
 */
export function exportClientsFile(
  exportFormat: string,
  token: string,
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // fetch historic ordenes
      const { data, error } = await graphQLFetch({
        query: EXPORT_CLIENTS_FILE,
        variables: {
          xformat: exportFormat,
          type: "clients",
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data && !data?.exportClientsFile) {
        throw new Error("Data is undefined");
      }
      if (
        data?.exportClientsFile.code &&
        data?.exportClientsFile.code > 0
      ) {
        throw new Error("Hubo un error, no se pudo exportar los clientess.");
      }
      const exportProd = data.exportClientsFile;
      const jData = JSON.parse(exportProd.file);
      const xfile = decodeFile(jData);
      // set file to be downloaded
      dispatch(
        slice.actions.addExportClientsSuccess({
          loaded: true,
          file: xfile,
        })
      );
    } catch (error: any) {
      console.warn("Issues exporting clients");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      dispatch(
        slice.actions.addExportClientsSuccess({
          loaded: true,
          file: undefined,
        })
      );
      throw new Error(error.toString());
    }
  };
}