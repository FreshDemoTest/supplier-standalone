// redux
import { createSlice } from "@reduxjs/toolkit";
// domain
import {
  DeliveryZones,
  DoWIdx,
  UnitDeliveryInfoType,
  UnitInvoiceInfoType,
  UnitStateType,
  UnitType,
  reverseDoWIdx,
} from "../../domain/account/SUnit";
import {
  BusinessType,
  DisplayAlimaInvoiceType,
  LegalBusinessType,
  StripeCardType,
  SupplierAlimaAccountSaasConfigType,
  SupplierAlimaAccountType,
  TransferAccountType,
} from "../../domain/account/Business";
import {
  UnitPermissionsType,
  UserInfoType,
  UserPermissionType,
} from "../../domain/account/User";
// graphql
import { graphQLFetch, graphQLFetchFiles } from "../../utils/graphql";
import {
  ADD_SUPPLIER_BUSINESS_IMAGE,
  CREATE_ALIMA_ACCOUNT,
  DELETE_SUPPLIER_BUSINESS_IMAGE,
  GET_ALIMA_ACCOUNT,
  GET_ALIMA_ACCOUNT_SAAS_CONFIG,
  GET_ALIMA_HISTORIC_INVOICES,
  GET_BUSINESS,
  NEW_BUSINESS,
  SET_SUPPLIER_MARKETPLACE_VISIBILITY,
  UPDATE_BUSINESS_INFO,
  UPDATE_LEGAL_INFO,
} from "../../queries/account/business";
import {
  DELETE_UNIT,
  EDIT_UNIT,
  GET_UNITS,
  GET_UNIT_BY_ID,
  GET_UNIT_CATEGS,
  NEW_AND_EDIT_UNIT_TAX,
  NEW_UNIT,
} from "../../queries/account/sunit";
import {
  DELETE_SUPPLIER_EMPLOYEE,
  GET_SUPPLIER_EMPLOYEES,
  NEW_SUPPLIER_EMPLOYEE,
  UPDATE_SUPPLIER_EMPLOYEE,
} from "../../queries/auth/registration";
// errors
import { GQLError } from "../../errors";
// utils
import { decodeFile, delay } from "../../utils/helpers";
import { paymentMethodType } from "../../domain/orden/Orden";
// import { EcommerceDetailsType } from "../../domain/account/Ecommerce";
// import { GET_ECOMMERCE_INFO, UPDATE_ECOMMERCE_PARAMS } from "../../queries/account/ecommerce";
import { AlimaPlanType } from "../../components/billing/AlimaSupplyPlan";
import {
  DELETE_STRIPE_CARD,
  GET_STRIPE_SETUP_INTENT,
} from "../../queries/account/billing";
import { EcommerceDetailsType } from "../../domain/account/Ecommerce";
import {
  ADD_ECOMMERCE_IMAGE,
  DELETE_ECOMMERCE_IMAGE,
  GET_ECOMMERCE_INFO,
  UPDATE_ECOMMERCE_PARAMS,
} from "../../queries/account/ecommerce";

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  inProcess: true,
  error: {
    active: false,
    body: "",
  },
  isBusinessOnboarded: false,
  businessLoaded: false,
  business: {
    businessName: "Nombre de tu Negocio...",
    businessType: undefined,
    email: "correo@electronico.com",
    phoneNumber: "5566889900",
    website: "",
    logoUrl: "",
  },
  alimaAccount: undefined as SupplierAlimaAccountType | undefined,
  saasConfig: undefined as SupplierAlimaAccountSaasConfigType | undefined,
  stripeSetupIntent: {
    clientSecret: undefined as string | undefined,
  },
  historicAlimaInvoices: [] as Array<DisplayAlimaInvoiceType>,
  legal: {
    legalRepresentative: "",
    idData: undefined,
    legalBusinessName: "",
    actConstData: undefined,
    fiscalRegime: undefined,
    zipCode: undefined,
    satRfc: undefined,
  },
  units: [] as Array<UnitStateType>,
  unitCategories: [] as Array<{ label: string; value: string }>,
  activeUnit: undefined as UnitStateType | undefined,
  editUnit: {
    id: "",
    unitName: "",
    city: "",
    country: "",
    estate: "",
    externalNum: "",
    fullAddress: "",
    internalNum: "",
    neighborhood: "",
    street: "",
    deleted: undefined,
    // tax info
    fiscalRegime: undefined,
    legalBusinessName: undefined,
    taxZipCode: undefined,
    certificateFile: undefined,
    secretsFile: undefined,
    passphrase: undefined,
    invoicePaymentMethod: undefined,
    invoicingTrigger: undefined,
    // delivery info
    deliveryTypes: [],
    deliverySchedules: [],
    deliveryZones: [],
    deliveryWindowSize: undefined,
    cutOffTime: undefined, // 14-23 hrs
    paymentMethods: [] as paymentMethodType[],
    accountNumber: "",
    warnDays: undefined, // days before delivery date
  } as (UnitStateType & UnitDeliveryInfoType) | undefined,
  team: [] as Array<UserPermissionType & UserInfoType>,
  teammateDetails: {
    user: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
    units: [] as Array<UnitPermissionsType>,
    role: "",
    department: "",
  } as (UserPermissionType & UserInfoType) | undefined,
  ecommerceDetails: undefined,
};

const slice = createSlice({
  name: "account",
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
    // SET Business Onboarded
    setBusinessOnboarded(state, action) {
      // validation just for Business Account and a Unit
      state.isBusinessOnboarded =
        action.payload.bAccount &&
        action.payload.units &&
        action.payload.legal &&
        action.payload.billing;
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
    // SET Business
    setBusinessSuccess(state, action) {
      state.isLoading = false;
      state.businessLoaded = true;
      state.business = action.payload;
    },
    // SET Alima Account
    setAlimaAccountSuccess(state, action) {
      state.isLoading = false;
      state.alimaAccount = action.payload;
    },
    // SET Stripe setup intent
    setStripeSetupIntentSuccess(state, action) {
      state.isLoading = false;
      state.stripeSetupIntent = action.payload;
    },
    // SET Alima Saas Config
    setAlimaAccountSaasConfigSuccess(state, action) {
      state.isLoading = false;
      state.saasConfig = action.payload;
    },
    // SET Alima Historic Invoics
    setHistoricAlimaInvoicesSuccess(state, action) {
      state.isLoading = false;
      state.historicAlimaInvoices = action.payload;
    },
    // ADD Unit
    addUnitSuccess(state, action) {
      state.isLoading = false;
      const _brn = action.payload;
      state.units.push(_brn);
    },
    // GET Unit
    getUnitsSuccess(state, action) {
      state.isLoading = false;
      state.units = action.payload;
    },
    // ADD Unit categories
    setUnitCategoriesSuccess(state, action) {
      state.isLoading = false;
      state.unitCategories = action.payload;
    },
    // SET Active Unit
    setActiveUnitSuccess(state, action) {
      state.isLoading = false;
      state.activeUnit = action.payload;
    },
    // SET Edit Unit
    setEditUnitSuccess(state, action) {
      state.isLoading = false;
      state.editUnit = action.payload;
    },
    resetEditUnitSuccess(state) {
      state.isLoading = false;
      state.editUnit = {
        id: "",
        unitName: "",
        city: "",
        country: "",
        estate: "",
        externalNum: "",
        fullAddress: "",
        internalNum: "",
        neighborhood: "",
        street: "",
        deleted: undefined,
        // tax info
        fiscalRegime: undefined,
        legalBusinessName: undefined,
        taxZipCode: undefined,
        certificateFile: undefined,
        secretsFile: undefined,
        passphrase: undefined,
        invoicePaymentMethod: undefined,
        invoicingTrigger: undefined,
        // delivery info
        deliveryTypes: [],
        deliverySchedules: [],
        deliveryZones: [],
        deliveryWindowSize: undefined,
        cutOffTime: undefined, // 14-23 hrs
        paymentMethods: [] as paymentMethodType[],
        accountNumber: "",
        warnDays: undefined, // days before delivery date
      } as (UnitStateType & UnitDeliveryInfoType) | undefined;
    },
    // SET Legal
    setLegalSuccess(state, action) {
      state.isLoading = false;
      state.legal = action.payload;
    },
    // UPDATE teammateDetails
    updateTeammateDetails(state, action) {
      state.isLoading = false;
      // filter from team
      const _mate = state.team.find((v) => v.user.id === action.payload);
      if (!_mate) {
        throw new Error("Teammate not found!");
      }
      state.teammateDetails = _mate;
    },
    // ADD new team member
    addTeammateSuccess(state, action) {
      state.isLoading = false;
      state.team.push(action.payload);
    },
    // SET team members
    setTeamSuccess(state, action) {
      state.isLoading = false;
      state.team = action.payload;
    },
    setEcommerceInfoSuccess(state, action) {
      state.isLoading = false;
      state.ecommerceDetails = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  setActiveUnitSuccess,
  setBusinessOnboarded,
  resetState,
  resetEditUnitSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

/**
 * Create Restaurant Business
 * @param mybusiness : BusinessType
 * @param myuser : UserType
 * @param token : string
 * @returns
 */
export function setBusinessAccount(mybusiness: BusinessType, token: string) {
  return async (dispatch: any) => {
    try {
      const { data, error } = await graphQLFetch({
        query: NEW_BUSINESS,
        variables: {
          name: mybusiness.businessName,
          country: "México", // Hard coded - update when multi-country support is added
          bizType: mybusiness.businessType.toUpperCase(),
          phone: "52" + mybusiness.phoneNumber.toString(),
          email: mybusiness.email,
          website: mybusiness.website || "",
          minOrder: {
            amount: mybusiness.minQuantity,
            measure: mybusiness.minQuantityUnit.toUpperCase(),
          },
          // paymethods: mybusiness.paymentMethods.map((v) => v.toUpperCase()),
          policy: mybusiness.policyTerms,
          // accountNumber: (mybusiness?.accountNumber || "").toUpperCase(),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      dispatch(
        slice.actions.setBusinessSuccess({
          id: data.newSupplierBusiness.id,
          businessName: data.newSupplierBusiness.businessName,
          businessType: data.newSupplierBusiness.account.businessType,
          email: data.newSupplierBusiness.account.email,
          phone: data.newSupplierBusiness.account.phoneNumber,
          website: data.newSupplierBusiness.account.website,
          active: data.newSupplierBusiness.active,
        })
      );
    } catch (error: any) {
      console.warn("Issues setting Business");
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
 * Update Supplier Business
 * @param mybusiness : BusinessType
 * @param token : string
 * @returns
 */
export function updateBusinessAccount(mybusiness: BusinessType, token: string) {
  return async (dispatch: any) => {
    try {
      if (!mybusiness.id) {
        throw new Error("Business ID is undefined");
      }
      const { data, error } = await graphQLFetch({
        query: UPDATE_BUSINESS_INFO,
        variables: {
          name: mybusiness.businessName,
          country: "México", // Hard coded - update when multi-country support is added
          supBusId: mybusiness.id,
          bizType: mybusiness.businessType.toUpperCase(),
          phone: "52" + mybusiness.phoneNumber.toString(),
          email: mybusiness.email,
          website: mybusiness.website || "",
          minOrder: {
            amount: mybusiness.minQuantity,
            measure: mybusiness.minQuantityUnit.toUpperCase(),
          },
          // paymethods: mybusiness.paymentMethods.map((v) => v.toUpperCase()),
          policy: mybusiness.policyTerms,
          // accountNumber: (mybusiness?.accountNumber || "").toUpperCase(),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data || data.updateSupplierBusiness.code > 0) {
        throw new Error("Data is undefined");
      }
      dispatch(
        slice.actions.setBusinessSuccess({
          id: data.updateSupplierBusiness.id,
          businessName: data.updateSupplierBusiness.businessName,
          businessType: data.updateSupplierBusiness.account.businessType,
          email: data.updateSupplierBusiness.account.email,
          phone: data.updateSupplierBusiness.account.phoneNumber,
          website: data.updateSupplierBusiness.account.website,
          active: data.updateSupplierBusiness.active,
        })
      );
    } catch (error: any) {
      console.warn("Issues update Business");
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
 * Add Supplier Business Image
 * @param token
 * @param imgFile
 * @param supplierBusinessId
 * @returns
 */
export function addSupplierBusinessImage(
  token: string,
  imgFile: any,
  supplierBusinessId: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierBusinessId) {
        throw new Error("Supplier Business ID is undefined");
      }
      const { data, error } = await graphQLFetchFiles({
        query: ADD_SUPPLIER_BUSINESS_IMAGE,
        variables: {
          imgFile: null,
          supBusId: supplierBusinessId,
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
        !data?.addSupplierBusinessImage ||
        data?.addSupplierBusinessImage?.code > 0
      ) {
        console.warn(
          data?.addSupplierBusinessImage?.msg ||
            "Error adding Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const newProdImg = data.addSupplierBusinessImage;
      if (!newProdImg?.status) {
        throw new Error("Image ID was not generated");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Business image");
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
 * Add Supplier Business Image
 * @param token
 * @param imgFile
 * @param supplierBusinessId
 * @returns
 */
export function addEcommerceImage(
  token: string,
  imgFile: any,
  supplierBusinessId: string,
  imageType: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierBusinessId) {
        throw new Error("Supplier Business ID is undefined");
      }
      const { data, error } = await graphQLFetchFiles({
        query: ADD_ECOMMERCE_IMAGE,
        variables: {
          imgFile: null,
          supBusId: supplierBusinessId,
          imgType: imageType.toUpperCase(),
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
        !data?.addEcommerceSellerImage ||
        data?.addEcommerceSellerImage?.code > 0
      ) {
        console.warn(
          data?.addEcommerceSellerImage?.msg ||
            "Error adding Ecommerce Prod image"
        );
        throw new Error("Data is undefined");
      }
      const newProdImg = data.addEcommerceSellerImage;
      if (!newProdImg?.status) {
        throw new Error("Image ID was not generated");
      }
      await delay(5000);
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Business image");
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
 * Delete Supplier Business Image
 * @param token
 * @param supplierBusinessId
 * @returns
 */
export function deleteSupplierBusinessImage(
  token: string,
  supplierBusinessId: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierBusinessId) {
        throw new Error("Supplier Business ID is undefined");
      }
      const { data, error } = await graphQLFetch({
        query: DELETE_SUPPLIER_BUSINESS_IMAGE,
        variables: {
          supBusId: supplierBusinessId,
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
        !data?.deleteSupplierBusinessImage ||
        data?.deleteSupplierBusinessImage?.code > 0
      ) {
        console.warn(
          data?.deleteSupplierBusinessImage?.msg ||
            "Error delete Supplier Prod image"
        );
        throw new Error("Data is undefined");
      }
      const newProdImg = data.deleteSupplierBusinessImage;
      if (!newProdImg?.status) {
        throw new Error("Image ID was not generated");
      }
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Business image");
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
 * Delete Supplier Business Image
 * @param token
 * @param supplierBusinessId
 * @returns
 */
export function deleteEcommerceImage(
  token: string,
  supplierBusinessId: string,
  imageType: string
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierBusinessId) {
        throw new Error("Supplier Business ID is undefined");
      }
      const { data, error } = await graphQLFetch({
        query: DELETE_ECOMMERCE_IMAGE,
        variables: {
          supBusId: supplierBusinessId,
          imgType: imageType.toUpperCase(),
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
        !data?.deleteEcommerceSellerImage ||
        data?.deleteEcommerceSellerImage?.code > 0
      ) {
        console.warn(
          data?.deleteEcommerceSellerImage?.msg ||
            "Error delete Ecommerce Prod image"
        );
        throw new Error("Data is undefined");
      }
      const newProdImg = data.deleteEcommerceSellerImage;
      if (!newProdImg?.status) {
        throw new Error("Image ID was not generated");
      }
      await delay(6000);
      // dispatch sorted sat codes
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues creating new Supplier Business image");
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
 * Get Business Account Info
 * @param token string
 * @returns
 */
export function getBusinessAccount(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_BUSINESS,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getSupplierBusinessFromToken.code > 0) {
        console.warn("No business found!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const comConds =
        data.getSupplierBusinessFromToken.account.defaultCommertialConditions;
      dispatch(
        slice.actions.setBusinessSuccess({
          id: data.getSupplierBusinessFromToken.id,
          businessName: data.getSupplierBusinessFromToken.businessName,
          businessType: data.getSupplierBusinessFromToken.account.businessType
            .toString()
            .toLowerCase(),
          email: data.getSupplierBusinessFromToken.account.email,
          phoneNumber:
            data.getSupplierBusinessFromToken.account.phoneNumber.slice(2, 12), // remove country code (52)
          website: data.getSupplierBusinessFromToken.account.website || "",
          active: data.getSupplierBusinessFromToken.active,
          minQuantity: comConds?.minimumOrderValue.amount,
          minQuantityUnit: comConds?.minimumOrderValue.measure.toLowerCase(),
          paymentMethods: comConds?.allowedPaymentMethods.map((v: any) =>
            v.toLowerCase()
          ),
          accountNumber: comConds?.accountNumber || "",
          policyTerms: comConds?.policyTerms || "",
          logoUrl: data.getSupplierBusinessFromToken.logoUrl || "",
        })
      );
      let idDataFile: Blob | undefined = undefined;
      let actConstFile: Blob | undefined = undefined;
      let csfFile: Blob | undefined = undefined;
      if (data.getSupplierBusinessFromToken.account.legalRepId) {
        const jdata = JSON.parse(
          data.getSupplierBusinessFromToken.account.legalRepId
        );
        idDataFile = decodeFile(jdata);
      }
      if (data.getSupplierBusinessFromToken.account.incorporationFile) {
        const kdata = JSON.parse(
          data.getSupplierBusinessFromToken.account.incorporationFile
        );
        actConstFile = decodeFile(kdata);
      }
      if (data.getSupplierBusinessFromToken.account.mxSatCsf) {
        const ldata = JSON.parse(
          data.getSupplierBusinessFromToken.account.mxSatCsf
        );
        csfFile = decodeFile(ldata);
      }
      dispatch(
        slice.actions.setLegalSuccess({
          legalRepresentative:
            data.getSupplierBusinessFromToken.account.legalRepName || "",
          idData: idDataFile,
          legalBusinessName:
            data.getSupplierBusinessFromToken.account.legalBusinessName || "",
          actConstData: actConstFile,
          csfData: csfFile,
          fiscalRegime:
            data.getSupplierBusinessFromToken.account.mxSatRegimen || undefined,
          zipCode:
            data.getSupplierBusinessFromToken.account.mxZipCode || undefined,
          satRfc:
            data.getSupplierBusinessFromToken.account.mxSatRfc || undefined,
        })
      );
    } catch (error: any) {
      console.warn("Issues getting Business");
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
 * Get Alima Historic Invoices
 * @param token string
 * @returns
 */
export function getHistoricAlimaInvoicesDetails(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ALIMA_HISTORIC_INVOICES,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getSupplierAlimaHistoricInvoices.supplierInvoices[0].code > 0) {
        console.warn("No alima account found!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const histAlInvs = data.getSupplierAlimaHistoricInvoices.supplierInvoices;
      dispatch(
        slice.actions.setHistoricAlimaInvoicesSuccess(
          histAlInvs.map((v: any) => {
            let invFiles: Blob[] = [];
            v.invoice.invoiceFiles.forEach((f: any) => {
              const jdata = JSON.parse(f);
              if (jdata.pdf) {
                invFiles.push(
                  decodeFile({
                    content: jdata.pdf,
                    filename: `factura-alima-${v.invoice.invoiceName}.pdf`,
                    mimetype: "application/pdf",
                  })
                );
              }
              if (jdata.xml) {
                invFiles.push(
                  decodeFile({
                    content: jdata.xml,
                    filename: `factura-alima-${v.invoice.invoiceName}.xml`,
                    mimetype: "application/xml",
                  })
                );
              }
            });
            return {
              invoiceId: v.invoice.id,
              invoiceName: v.invoice.invoiceName,
              emissionDate: new Date(v.invoice.createdAt),
              payedStatus: v.invoicePaystatus.status === "PAID",
              totalAmount: v.invoice.total,
              invCharges: v.invoiceCharges || [],
              invoiceFiles: invFiles,
              invoiceStatus: v.invoice.status,
            };
          })
        )
      );
    } catch (error: any) {
      console.warn("Issues getting Historic Alima Invoices");
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
 * Get Supplier Account Info
 * @param token string
 * @returns
 */
export function getSupplierAlimaAccount(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ALIMA_ACCOUNT,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getSupplierAlimaAccountFromToken.code > 0) {
        console.warn("No alima account found!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const alAcc = data.getSupplierAlimaAccountFromToken;
      const stripeCards: StripeCardType[] = [];
      let transferAcc: TransferAccountType | undefined = undefined;
      // For Card in Stripe -> add cards
      const pm: any | undefined = alAcc.paymentMethods[0];
      if (pm && pm.paymentProvider === "CARD_STRIPE") {
        const parseCards: any[] = JSON.parse(pm.providerData);
        if (parseCards) {
          parseCards.forEach((c: any) => {
            stripeCards.push({
              id: c.id,
              nameInCard: c?.billing_details?.name || "",
              cardBrand: c?.card?.display_brand || "",
              cardLast4: c?.card?.last4 || "",
            });
          });
        }
      }
      // For Transfer Account -> add transfer account
      if (pm && pm.paymentProvider.includes("TRANSFER")) {
        transferAcc = {
          id: pm.paymentProviderId || "",
          accountName: pm.accountName || "",
          bankName: pm.bankName,
          accountNumber: pm.accountNumber,
        };
      }
      dispatch(
        slice.actions.setAlimaAccountSuccess({
          ...alAcc,
          paymentMethods: [
            { ...pm, transferAccount: transferAcc, stripeCards },
          ],
        })
      );
    } catch (error: any) {
      console.warn("Issues getting Alima Historic Invoices");
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
 * Create Supplier Account Info
 * @param token string
 * @param plan AlimaAccountPlan
 * @returns
 */
export function createSupplierAlimaAccount(token: string, plan: AlimaPlanType) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: CREATE_ALIMA_ACCOUNT,
        variables: {
          plan: plan.toUpperCase(),
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.createSupplierAlimaAccountFromToken.code > 0) {
        throw new Error(
          "Issues creating Alima Account: " +
            data.createSupplierAlimaAccountFromToken.msg
        );
      }
      const alAcc = data.createSupplierAlimaAccountFromToken;
      const stripeCards: StripeCardType[] = [];
      let transferAcc: TransferAccountType | undefined = undefined;
      // For Card in Stripe -> add cards
      const pm: any | undefined = alAcc.paymentMethods[0];
      if (pm && pm.paymentProvider === "CARD_STRIPE") {
        const parseCards: any[] = JSON.parse(pm.providerData);
        if (parseCards) {
          parseCards.forEach((c: any) => {
            stripeCards.push({
              id: c.id,
              nameInCard: c?.billing_details?.name || "",
              cardBrand: c?.card?.display_brand || "",
              cardLast4: c?.card?.last4 || "",
            });
          });
        }
      }
      // For Transfer Account -> add transfer account
      if (pm && pm.paymentProvider.includes("TRANSFER")) {
        transferAcc = {
          id: pm.paymentProviderId || "",
          accountName: pm.accountName || "",
          bankName: pm.bankName,
          accountNumber: pm.accountNumber,
        };
      }
      dispatch(
        slice.actions.setAlimaAccountSuccess({
          ...alAcc,
          paymentMethods: [
            { ...pm, transferAccount: transferAcc, stripeCards },
          ],
        })
      );
    } catch (error: any) {
      console.warn("Issues creating Alima Account");
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
 * Get Supplier Account Saas Config Info
 * @param token string
 * @returns
 */
export function getSupplierAlimaAccountSaasConfig(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ALIMA_ACCOUNT_SAAS_CONFIG,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getSupplierAlimaAccountConfigFromToken.code > 0) {
        console.warn("No alima account config found!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const alAccCfg = data.getSupplierAlimaAccountConfigFromToken;
      dispatch(
        slice.actions.setAlimaAccountSaasConfigSuccess({
          ...alAccCfg,
          config: alAccCfg.config ? JSON.parse(alAccCfg.config) : undefined,
        })
      );
    } catch (error: any) {
      console.warn("Issues getting Alima Saas Config");
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
 * Get Stripe Setup Intent
 * @param token string
 * @param stripeCustomerId string
 * @returns
 */
export function getStripeSetupIntent(token: string, stripeCustomerId: string) {
  return async (dispatch: any) => {
    try {
      if (!stripeCustomerId) {
        throw new Error("Stripe Customer ID is undefined");
      }
      // dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_STRIPE_SETUP_INTENT,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        variables: {
          stripeCustId: stripeCustomerId,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getSupplierAlimaAccountStripeSetupIntentSecret.code > 0) {
        console.warn("No stripe setup intent found!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const stripeIntent = data.getSupplierAlimaAccountStripeSetupIntentSecret;
      dispatch(
        slice.actions.setStripeSetupIntentSuccess({
          clientSecret: stripeIntent.secret,
        })
      );
    } catch (error: any) {
      console.warn("Issues getting Stripe Setup Intent");
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
 * Update Supplier Business
 * @param businessId : string
 * @param display : boolean
 * @param token : string
 * @returns
 */
export function setMarketplaceVisibility(
  businessId: string,
  display: boolean,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!businessId) {
        throw new Error("Business ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: SET_SUPPLIER_MARKETPLACE_VISIBILITY,
        variables: {
          supBusId: businessId,
          displayMkt: display,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data || data.updateSupplierBusiness.code > 0) {
        throw new Error("Data is undefined");
      }
      dispatch(
        slice.actions.setBusinessSuccess({
          id: data.updateSupplierBusiness.id,
          businessName: data.updateSupplierBusiness.businessName,
          businessType: data.updateSupplierBusiness.account.businessType,
          email: data.updateSupplierBusiness.account.email,
          phone: data.updateSupplierBusiness.account.phoneNumber,
          website: data.updateSupplierBusiness.account.website,
          active: data.updateSupplierBusiness.active,
        })
      );
    } catch (error: any) {
      console.warn("Issues update marketplace visbility");
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
 * Get Unit Categories
 * @returns
 */
export function getUnitCategories() {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_UNIT_CATEGS,
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      // dispatch sorted categories
      dispatch(
        slice.actions.setUnitCategoriesSuccess(
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
      console.warn("Issues getting Unit Categories");
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
 * Create new branch
 * @param myunit : UnitType & UnitInvoiceInfoType & UnitDeliveryInfoType
 * @param mybusiness : BusinessType
 * @param token : string
 * @returns
 */
export function addUnit(
  myunit: UnitType & UnitInvoiceInfoType & UnitDeliveryInfoType,
  mybusiness: BusinessType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      // data validation
      if (!mybusiness.id) {
        throw new Error("Business ID is undefined");
      }
      if (!myunit.paymentMethods) {
        throw new Error("Not Payment Methods");
      }
      // api call - add branch
      const { data, error } = await graphQLFetch({
        query: NEW_UNIT,
        variables: {
          supBId: mybusiness.id,
          name: myunit.unitName,
          street: myunit.street,
          extN: myunit.externalNum,
          intN: myunit.internalNum || "",
          neigh: myunit.neighborhood,
          city: myunit.city,
          estate: myunit.estate,
          country: myunit.country,
          zipCode: myunit.zipCode,
          paymethods: myunit.paymentMethods.map((v) => v.toUpperCase()),
          accountNumber: (myunit?.accountNumber || "").toUpperCase(),
          categoryId: myunit.unitCategory,
          fAddress: `${myunit.street} ${myunit.externalNum}${
            myunit.internalNum ? " " + myunit.internalNum : ""
          }, ${myunit.neighborhood}, ${myunit.city}, ${myunit.estate}, ${
            myunit.country
          }, C.P. ${myunit.zipCode}`,
          delivOpts: {
            warningTime: myunit.warnDays,
            cutoffTime: (myunit?.cutOffTime || 0) + 12, // 24h format
            deliveryTimeWindow: myunit.deliveryWindowSize,
            sellingOption: myunit.deliveryTypes.map((d) => {
              return d.toUpperCase() === "PICKUP"
                ? "PICKUP"
                : "SCHEDULED_DELIVERY";
            }),
            serviceHours: myunit.deliverySchedules.map((d) => {
              return {
                dow: DoWIdx[d.dow],
                start: d.start,
                end: d.end,
              };
            }),
            regions: myunit.deliveryZones.map((d) => {
              return d
                .toUpperCase()
                .replaceAll(" ", "_")
                .replaceAll("/", "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            }),
          },
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw new GQLError(error, "SupplierUnit");
      }
      if (!data && !data.newSupplierUnit && !data.newSupplierUnit.id) {
        throw new GQLError("Data is undefined", "SupplierUnit");
      }
      // api call - add unit tax info
      let taxData: any = {};
      let certFile: Blob | undefined = undefined;
      let secretsFile: Blob | undefined = undefined;
      let invTrigger: any = undefined;
      if (
        myunit.taxId &&
        myunit.fiscalRegime &&
        myunit.legalBusinessName &&
        myunit.taxZipCode &&
        myunit.certificateFile &&
        myunit.secretsFile &&
        myunit.passphrase &&
        myunit.invoicePaymentMethod &&
        myunit.invoicingTrigger
      ) {
        const { data: dataTax, error: errorTax } = await graphQLFetchFiles({
          query: NEW_AND_EDIT_UNIT_TAX,
          variables: {
            rfc: myunit.taxId,
            legalName: myunit.legalBusinessName.trim(),
            cerFile: null,
            keyFile: null,
            passcode: myunit.passphrase,
            invoicePayType: myunit.invoicePaymentMethod,
            invoiceTriggerType: myunit.invoicingTrigger,
            fiscalRegime: "REG_" + myunit.fiscalRegime.toString(),
            supUnitId: data.newSupplierUnit.id,
            taxZipCode: myunit.taxZipCode,
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
          files: {
            files: {
              cerFile: [myunit.certificateFile, myunit.certificateFile?.name],
              keyFile: [myunit.secretsFile, myunit.secretsFile?.name],
            },
            map: {
              cerFile: ["variables.cerFile"],
              keyFile: ["variables.keyFile"],
            },
          },
        });
        if (errorTax) {
          throw new GQLError(errorTax, "SupplierUnitTaxInfo");
        }
        if (!dataTax && !dataTax.upsertSupplierCsd) {
          throw new GQLError("Data is undefined", "SupplierUnitTaxInfo");
        }
        // assign gql data
        taxData = { ...dataTax.upsertSupplierCsd.mxSatCertificate };
        // assign files
        if (taxData.cerFile) {
          const jdata = JSON.parse(taxData.cerFile);
          certFile = decodeFile(jdata);
        }
        if (taxData.keyFile) {
          const kdata = JSON.parse(taxData.keyFile);
          secretsFile = decodeFile(kdata);
        }
        // assign invoice trigger
        if (taxData?.invoicingOptions?.automatedInvoicing) {
          if (taxData?.invoicingOptions?.triggeredAt === "AT_PURCHASE") {
            invTrigger = "at_purchase";
          } else if (taxData?.invoicingOptions?.triggeredAt === "AT_DELIVERY") {
            invTrigger = "at_delivery";
          }
        } else {
          invTrigger = "deactivated";
        }
      }
      dispatch(
        slice.actions.addUnitSuccess({
          id: data.newSupplierUnit.id,
          unitName: data.newSupplierUnit.unitName,
          unitCategory: data.newSupplierUnit.unitCategory.supplierCategoryId,
          street: data.newSupplierUnit.street,
          externalNum: data.newSupplierUnit.externalNum,
          internalNum: data.newSupplierUnit.internalNum || "",
          neighborhood: data.newSupplierUnit.neighborhood,
          city: data.newSupplierUnit.city,
          estate: data.newSupplierUnit.estate,
          country: data.newSupplierUnit.country,
          zipCode: data.newSupplierUnit.zipCode,
          fullAddress: data.newSupplierUnit.fullAddress,
          deleted: false,
          // fetch this from tax info
          taxId: taxData?.rfc || "",
          fiscalRegime:
            taxData?.fiscalRegime?.toString().replace("REG_", "") || "",
          legalBusinessName: taxData?.legalName || "",
          taxZipCode: taxData?.taxZipCode || "",
          certificateFile: certFile,
          secretsFile: secretsFile,
          passphrase: taxData?.satPassCode || "",
          invoicePaymentMethod: taxData?.invoicingOptions?.invoiceType || "",
          invoicingTrigger: invTrigger,
        })
      );
    } catch (error: any) {
      console.warn("Issues adding Unit!");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      if (error instanceof GQLError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Edit branch
 * @param myunit : UnitType & UnitInvoiceInfoType
 * @param token : string
 * @returns
 */
export function editUnit(
  myunit: UnitType & UnitInvoiceInfoType & UnitDeliveryInfoType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      // data validation
      if (!myunit.id) {
        throw new Error("Branch ID is undefined");
      }
      if (!myunit.paymentMethods) {
        throw new Error("Not Payment Methods");
      }
      // api call - edit branch
      const { data, error } = await graphQLFetch({
        query: EDIT_UNIT,
        variables: {
          supUnitId: myunit.id,
          name: myunit.unitName,
          street: myunit.street,
          extN: myunit.externalNum,
          intN: myunit.internalNum || "",
          neigh: myunit.neighborhood,
          city: myunit.city,
          estate: myunit.estate,
          country: myunit.country,
          zipCode: myunit.zipCode,
          categoryId: myunit.unitCategory,
          paymethods: myunit.paymentMethods.map((v) => v.toUpperCase()),
          accountNumber: (myunit?.accountNumber || "").toUpperCase(),
          fAddress: `${myunit.street} ${myunit.externalNum}${
            myunit.internalNum ? " " + myunit.internalNum : ""
          }, ${myunit.neighborhood}, ${myunit.city}, ${myunit.estate}, ${
            myunit.country
          }, C.P. ${myunit.zipCode}`,
          delivOpts: {
            warningTime: myunit.warnDays,
            cutoffTime: (myunit?.cutOffTime || 0) + 12, // 24h format
            deliveryTimeWindow: myunit.deliveryWindowSize,
            sellingOption: myunit.deliveryTypes.map((d) => {
              return d.toUpperCase() === "PICKUP"
                ? "PICKUP"
                : "SCHEDULED_DELIVERY";
            }),
            serviceHours: myunit.deliverySchedules.map((d) => {
              return {
                dow: DoWIdx[d.dow],
                start: d.start,
                end: d.end,
              };
            }),
            regions: myunit.deliveryZones.map((d) => {
              return d
                .toUpperCase()
                .replaceAll(" ", "_")
                .replaceAll("/", "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            }),
          },
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw new GQLError(error, "SupplierUnit");
      }
      if (!data || !data.updateSupplierUnit || !data.updateSupplierUnit.id) {
        throw new GQLError("Data is undefined", "SupplierUnit");
      }
      // api call - add branch tax info
      // api call - add unit tax info
      let taxData: any = {};
      let certFile: Blob | undefined = undefined;
      let secretsFile: Blob | undefined = undefined;
      let invTrigger: any = undefined;
      if (
        myunit.taxId &&
        myunit.fiscalRegime &&
        myunit.legalBusinessName &&
        myunit.taxZipCode &&
        myunit.certificateFile &&
        myunit.secretsFile &&
        myunit.passphrase &&
        myunit.invoicePaymentMethod &&
        myunit.invoicingTrigger
      ) {
        const { data: dataTax, error: errorTax } = await graphQLFetchFiles({
          query: NEW_AND_EDIT_UNIT_TAX,
          variables: {
            rfc: myunit.taxId,
            legalName: myunit.legalBusinessName.trim(),
            cerFile: null,
            keyFile: null,
            passcode: myunit.passphrase,
            invoicePayType: myunit.invoicePaymentMethod,
            invoiceTriggerType: myunit.invoicingTrigger,
            fiscalRegime: "REG_" + myunit.fiscalRegime.toString(),
            supUnitId: data.updateSupplierUnit.id,
            taxZipCode: myunit.taxZipCode,
          },
          headers: {
            Authorization: `supplybasic ${token}`,
          },
          files: {
            files: {
              cerFile: [myunit.certificateFile, myunit.certificateFile?.name],
              keyFile: [myunit.secretsFile, myunit.secretsFile?.name],
            },
            map: {
              cerFile: ["variables.cerFile"],
              keyFile: ["variables.keyFile"],
            },
          },
        });
        if (errorTax) {
          throw new GQLError(errorTax, "SupplierUnitTaxInfo");
        }
        if (!dataTax && !dataTax.upsertSupplierCsd) {
          throw new GQLError("Data is undefined", "SupplierUnitTaxInfo");
        }
        // assign gql data
        taxData = { ...dataTax.upsertSupplierCsd.mxSatCertificate };
        // assign files
        if (taxData.cerFile) {
          const jdata = JSON.parse(taxData.cerFile);
          certFile = decodeFile(jdata);
        }
        if (taxData.keyFile) {
          const kdata = JSON.parse(taxData.keyFile);
          secretsFile = decodeFile(kdata);
        }
        // assign invoice trigger
        if (taxData?.invoicingOptions?.automatedInvoicing) {
          if (taxData?.invoicingOptions?.triggeredAt === "AT_PURCHASE") {
            invTrigger = "at_purchase";
          } else if (taxData?.invoicingOptions?.triggeredAt === "AT_DELIVERY") {
            invTrigger = "at_delivery";
          }
        } else {
          invTrigger = "deactivated";
        }
      }
      const suData = data.updateSupplierUnit;
      dispatch(
        slice.actions.addUnitSuccess({
          id: suData.id,
          unitName: suData.unitName,
          unitCategory: suData.unitCategory.supplierCategoryId,
          street: suData.street,
          externalNum: suData.externalNum,
          internalNum: suData.internalNum || "",
          neighborhood: suData.neighborhood,
          city: suData.city,
          estate: suData.estate,
          country: suData.country,
          zipCode: suData.zipCode,
          fullAddress: suData.fullAddress,
          deleted: false,
          paymentMethods: suData.allowedPaymentMethods.map((v: any) =>
            v.toLowerCase()
          ),
          accountNumber: suData.accountNumber || "",
          // fetch this from tax info
          taxId: taxData?.rfc || "",
          fiscalRegime:
            taxData?.fiscalRegime?.toString().replace("REG_", "") || "",
          legalBusinessName: taxData?.legalName || "",
          taxZipCode: taxData?.taxZipCode || "",
          certificateFile: certFile,
          secretsFile: secretsFile,
          passphrase: taxData?.satPassCode || "",
          invoicePaymentMethod: taxData?.invoicingOptions?.invoiceType || "",
          invoicingTrigger: invTrigger,
        })
      );
    } catch (error: any) {
      console.warn("Issues updating Unit!");
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error,
        })
      );
      if (error instanceof GQLError) {
        throw error;
      } else {
        throw new Error(error.toString());
      }
    }
  };
}

// ----------------------------------------------------------------------

/**
 * Fetch units
 * @param mybusiness BusinessType
 * @param token string
 * @returns
 */
export function getUnits(mybusiness: BusinessType, token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!mybusiness.id) {
        throw new Error("Business ID is undefined");
      }
      // api call
      const { data, error } = await graphQLFetch({
        query: GET_UNITS,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data || !data.getSupplierUnitsFromToken) {
        throw new Error("Data is undefined");
      }
      if (
        data.getSupplierUnitsFromToken.length === 0 ||
        data.getSupplierUnitsFromToken[0].code > 0
      ) {
        console.warn("No units found!");
        dispatch(slice.actions.getUnitsSuccess([]));
        return;
      }
      dispatch(
        slice.actions.getUnitsSuccess(
          data.getSupplierUnitsFromToken.map((v: any) => ({
            id: v.id,
            unitName: v.unitName,
            // unitCategoryId: v.unitCategory.supplierCategoryId,
            unitCategory: v.unitCategory.supplierCategoryId,
            fullAddress: v.fullAddress,
            deleted: v.deleted,
            paymentMethods: v.allowedPaymentMethods.map((v: any) =>
              v.toLowerCase()
            ),
            accountNumber: v.accountNumber || "",
            // delivery info
            deliveryTypes:
              v.deliveryInfo?.sellingOption.map((s: any) => {
                return s === "PICKUP" ? "pickup" : "delivery";
              }) || [],
            deliverySchedules:
              v.deliveryInfo?.serviceHours.map((d: any) => {
                return {
                  dow: reverseDoWIdx[d.dow as keyof typeof reverseDoWIdx],
                  start: d.start,
                  end: d.end,
                };
              }) || [],
            deliveryZones: DeliveryZones.filter((z) => {
              return v.deliveryInfo?.regions.includes(
                z.zoneName
                  .toUpperCase()
                  .replaceAll(" ", "_")
                  .replaceAll("/", "")
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
              );
            }).map((z) => z.zoneName),
            deliveryWindowSize: v.deliveryInfo?.deliveryTimeWindow,
            cutOffTime: v.deliveryInfo
              ? v.deliveryInfo.cutoffTime - 12
              : undefined, // 14-23 hrs
            warnDays: v.deliveryInfo?.warningTime, // days before delivery date
          }))
        )
      );
    } catch (error: any) {
      console.warn("Issues getting all Units!");
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
 * Get Unit by ID
 * @param unitId string
 * @param token string
 * @returns
 */
export function getUnit(unitId: string, token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // api call
      const { data, error } = await graphQLFetch({
        query: GET_UNIT_BY_ID,
        variables: {
          unitId: unitId,
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
        !data.getSupplierUnitsFromToken ||
        !data.getSupplierUnitsFromToken[0].id
      ) {
        throw new Error("Data is undefined");
      }
      // data conversion
      const v = data.getSupplierUnitsFromToken[0];
      let certificateFile: Blob | undefined = undefined;
      let secretsFile: Blob | undefined = undefined;
      if (v.taxInfo?.cerFile) {
        const jdata = JSON.parse(v.taxInfo.cerFile);
        certificateFile = decodeFile(jdata);
      }
      if (v.taxInfo?.keyFile) {
        const kdata = JSON.parse(v.taxInfo.keyFile);
        secretsFile = decodeFile(kdata);
      }
      let invTrigger: string = "deactivated";
      if (v.taxInfo?.invoicingOptions?.automatedInvoicing) {
        if (v.taxInfo?.invoicingOptions?.triggeredAt === "AT_PURCHASE") {
          invTrigger = "at_purchase";
        } else if (v.taxInfo?.invoicingOptions?.triggeredAt === "AT_DELIVERY") {
          invTrigger = "at_delivery";
        }
      }
      // dispatch
      dispatch(
        slice.actions.setEditUnitSuccess({
          id: v.id,
          unitName: v.unitName,
          unitCategory: v.unitCategory.supplierCategoryId,
          street: v.street,
          externalNum: v.externalNum,
          internalNum: v.internalNum || "",
          neighborhood: v.neighborhood,
          city: v.city,
          estate: v.estate,
          country: v.country,
          zipCode: v.zipCode,
          fullAddress: v.fullAddress,
          paymentMethods: v.allowedPaymentMethods.map((v: any) => {
            const _v = v.toLowerCase();
            if (_v === "to_be_determined") {
              return "TBD";
            }
            return _v;
          }),
          accountNumber: v.accountNumber || "",
          deleted: v.deleted,
          // fetch this from tax info
          fiscalRegime:
            v.taxInfo?.satRegime?.toString().replace("REG_", "") || "",
          taxId: v.taxInfo?.rfc || "",
          taxZipCode: v.taxInfo?.taxZipCode || "",
          legalBusinessName: v.taxInfo?.legalName || "",
          certificateFile: certificateFile,
          secretsFile: secretsFile,
          passphrase: v.taxInfo?.satPassCode || "",
          invoicePaymentMethod: v.taxInfo?.invoicingOptions?.invoiceType,
          invoicingTrigger: invTrigger,
          // delivery info
          deliveryTypes:
            v.deliveryInfo?.sellingOption.map((s: any) => {
              return s === "PICKUP" ? "pickup" : "delivery";
            }) || [],
          deliverySchedules:
            v.deliveryInfo?.serviceHours.map((d: any) => {
              return {
                dow: reverseDoWIdx[d.dow as keyof typeof reverseDoWIdx],
                start: d.start,
                end: d.end,
              };
            }) || [],
          deliveryZones: DeliveryZones.filter((z) => {
            return v.deliveryInfo?.regions.includes(
              z.zoneName
                .split(",")[0]
                .toUpperCase()
                .replaceAll(" ", "_")
                .replaceAll("/", "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            );
          }).map((z) => z.zoneName),
          deliveryWindowSize: v.deliveryInfo?.deliveryTimeWindow,
          cutOffTime: v.deliveryInfo
            ? v.deliveryInfo.cutoffTime - 12
            : undefined, // 14-23 hrs
          warnDays: v.deliveryInfo?.warningTime, // days before delivery date
        })
      );
    } catch (error: any) {
      console.warn("Issues getting Unit!");
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
 * Delete Unit by ID
 * @param unitId string
 * @param token string
 * @returns
 */
export function deleteUnit(unitId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!unitId) {
        throw new Error("Unit ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // api call
      const { data, error } = await graphQLFetch({
        query: DELETE_UNIT,
        variables: {
          supUnitId: unitId,
          delete: true,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data && !data.updateSupplierUnit && !data.updateSupplierUnit.id) ||
        data.updateSupplierUnit.code > 0
      ) {
        throw new Error("Issues deleting Unit!");
      }
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues deleting Unit!");
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
 *
 * @param error
 * @returns
 */
export function raiseBusinessError(error: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.hasError({
        status: true,
        body: error,
      })
    );
  };
}

// ----------------------------------------------------------------------

/**
 * Upload Legal Business Info
 * @param businessId: string
 * @param mylegal : LegalBusinessType
 * @param token : string
 * @returns
 */
export function setLegalBusiness(
  businessId: string,
  mylegal: LegalBusinessType,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!businessId) {
        throw new Error("Business ID is undefined");
      }
      const _vars: any = {
        supBusId: businessId,
        legalName: mylegal.legalBusinessName,
        legalRep: mylegal.legalRepresentative,
        fiscalRegime: mylegal.fiscalRegime,
        satRfc: mylegal.satRfc,
        zipCode: mylegal.zipCode,
      };
      const _files: any = {};
      const _map: any = {};
      if (mylegal.idData) {
        _vars.legalRepId = null;
        _files.legalRepId = [mylegal.idData, mylegal.idData?.name];
        _map.legalRepId = ["variables.legalRepId"];
      }
      if (mylegal.actConstData) {
        _vars.incorpFile = null;
        _files.incorpFile = [mylegal.actConstData, mylegal.actConstData?.name];
        _map.incorpFile = ["variables.incorpFile"];
      }
      if (mylegal.csfData) {
        _vars.csfFile = null;
        _files.csfFile = [mylegal.csfData, mylegal.csfData?.name];
        _map.csfFile = ["variables.csfFile"];
      }
      const { data, error } = await graphQLFetchFiles({
        query: UPDATE_LEGAL_INFO,
        variables: {
          ..._vars,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        files: {
          files: {
            ..._files,
          },
          map: {
            ..._map,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.updateSupplierBusiness.code > 0) {
        throw new Error("Issues setting Legal Business");
      }
      dispatch(slice.actions.setLegalSuccess(mylegal));
    } catch (error: any) {
      console.warn("Issues setting Legal Business");
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
 * Update new permissions
 * @param myteammate : UserPermissionType & UserInfoType
 * @param businessId: string
 * @param token : string
 * @returns
 */
export function updateTeamMember(
  myteammate: UserPermissionType & UserInfoType,
  businessId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!businessId) {
        throw new Error("Business ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      const fmt_perms =
        myteammate.units?.map((v) => ({
          unitId: v.unit.id,
          permissions: v.permissions.map((w) => ({
            key: w.key,
            validation: w.value,
          })),
        })) || null;
      // api call
      const { data, error } = await graphQLFetch({
        query: UPDATE_SUPPLIER_EMPLOYEE,
        variables: {
          supUserId: myteammate.user.id,
          email: myteammate.user.email,
          firstName: myteammate.user.firstName,
          lastName: myteammate.user.lastName,
          phoneNumber: myteammate.user.phoneNumber?.toString(),
          department: myteammate.department,
          position: myteammate.role,
          supBusId: businessId,
          perms: fmt_perms,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data &&
          !data.updateSupplierEmployee &&
          !data.updateSupplierEmployee.id) ||
        data.updateSupplierEmployee.code > 0
      ) {
        throw new Error("Issues updating Supplier Employee!");
      }
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues updating teammate details");
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
 * Add new team member
 * @param myteammate : UserPermissionType & UserInfoType
 * @param businessId: string
 * @param token : string
 * @returns
 */
export function addNewTeamMember(
  myteammate: UserPermissionType & UserInfoType,
  businessId: string,
  token: string
) {
  return async (dispatch: any) => {
    try {
      if (!businessId) {
        throw new Error("Business ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      const fmt_perms =
        myteammate.units?.map((v) => ({
          unitId: v.unit.id,
          permissions: v.permissions.map((w) => ({
            key: w.key,
            validation: w.value,
          })),
        })) || null;
      // api call
      const { data, error } = await graphQLFetch({
        query: NEW_SUPPLIER_EMPLOYEE,
        variables: {
          email: myteammate.user.email,
          firstName: myteammate.user.firstName,
          lastName: myteammate.user.lastName,
          phoneNumber: myteammate.user.phoneNumber?.toString(),
          department: myteammate.department,
          position: myteammate.role,
          supBusId: businessId,
          perms: fmt_perms,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data && !data.newSupplierEmployee && !data.newSupplierEmployee.id) ||
        data.newSupplierEmployee.code > 0
      ) {
        throw new Error("Issues creating Supplier Employee!");
      }
      dispatch(slice.actions.addTeammateSuccess(myteammate));
    } catch (error: any) {
      console.warn("Issues adding teammate!");
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
 * Get team members
 * @param businessId: string
 * @param token : string
 * @returns
 */
export function getTeamMembers(businessId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!businessId) {
        throw new Error("Business ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // api call
      const { data, error } = await graphQLFetch({
        query: GET_SUPPLIER_EMPLOYEES,
        variables: {
          supBusId: businessId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data && !data.getSupplierEmployees) ||
        data.getSupplierEmployees.length === 0 ||
        data.getSupplierEmployees[0].code > 0
      ) {
        throw new Error("Issues getting Supplier Employee!");
      }
      const myteam = data.getSupplierEmployees.map((v: any) => ({
        user: {
          id: v.supplierUser.id,
          firstName: v.supplierUser.user.firstName,
          lastName: v.supplierUser.user.lastName,
          email: v.supplierUser.user.email,
          phoneNumber:
            v.supplierUser.user.phoneNumber.length > 10
              ? v.supplierUser.user.phoneNumber.slice(2)
              : v.supplierUser.user.phoneNumber,
          deleted: v.supplierUser.deleted,
          enabled: v.supplierUser.enabled,
        },
        department: v.employee?.department || "",
        role: v.supplierUser.role,
        units:
          v.employee?.unitPermissions?.map((w: any) => ({
            unit: {
              id: w.unitId,
            },
            permissions: w.permissions.map((x: any) => ({
              key: x.key,
              value: x.validation,
            })),
          })) || [],
      }));
      dispatch(slice.actions.setTeamSuccess(myteam));
    } catch (error: any) {
      console.warn("Issues getting teammates!");
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
 * Get Team mate details by ID
 * @param myteammateUserId
 * @returns
 */
export function getTeammate(myteammateUserId: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // get teamate from info requested in getTeamMembers
      dispatch(slice.actions.updateTeammateDetails(myteammateUserId));
    } catch (error: any) {
      console.warn("Issues getting teammate!");
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
 * Delete team member
 * @param myteammateId : string
 * @param token : string
 * @returns
 */
export function deleteTeamMember(myteammateId: string, token: string) {
  return async (dispatch: any) => {
    try {
      if (!myteammateId) {
        throw new Error("Employee ID is undefined");
      }
      dispatch(slice.actions.startLoading());
      // api call
      const { data, error } = await graphQLFetch({
        query: DELETE_SUPPLIER_EMPLOYEE,
        variables: {
          supUserId: myteammateId,
        },
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (
        (!data && !data.deleteSupplierUser) ||
        data.deleteSupplierUser.code > 0
      ) {
        throw new Error("Issues deleting Supplier Employee!");
      }
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues deleting teammate details");
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
 * Get Stripe Setup Intent
 * @param token string
 * @param stripeCustomerId string
 * @param stripeCardId string
 * @returns
 */
export function deleteStripeCard(
  token: string,
  stripeCustomerId: string,
  stripeCardId: string
) {
  return async (dispatch: any) => {
    try {
      if (!stripeCustomerId || !stripeCardId) {
        throw new Error("Stripe Customer ID or Card Id is undefined");
      }
      // dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: DELETE_STRIPE_CARD,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        variables: {
          stripeCustId: stripeCustomerId,
          stripeCardId: stripeCardId,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.deleteSupplierAlimaStripeCreditCard.code > 0) {
        console.warn("Error to delete card!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      } else if (!data.deleteSupplierAlimaStripeCreditCard.status) {
        console.warn("Error to delete card!");
        throw new Error("Error to delete card!");
      }
      dispatch(slice.actions.finishProcess());
    } catch (error: any) {
      console.warn("Issues deleting Stipe Card");
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
 * Get Stripe Setup Intent
 * @param token string
 * @param supplierBusinessId
 * @returns
 */
export function getEcommerceInfo(token: string) {
  return async (dispatch: any) => {
    try {
      // dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_ECOMMERCE_INFO, //TODO change to getEcommerceSellerInfoByToken
        headers: {
          Authorization: `supplybasic ${token}`,
        },
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("Data is undefined");
      }
      if (data.getEcommerceSellerInfoByToken.code > 0) {
        console.warn("Error to get ecommerce User!");
        dispatch(
          slice.actions.hasError({
            active: true,
            body: error,
          })
        );
        return;
      }
      const ecommerceInfo = {
        ...data.getEcommerceSellerInfoByToken,
        categories:
          data.getEcommerceSellerInfoByToken.categories === '' ? [] : data.getEcommerceSellerInfoByToken.categories.split(","),
        recProds: data.getEcommerceSellerInfoByToken.recProds === '' ? [] : data.getEcommerceSellerInfoByToken.recProds.split(","),
      } as EcommerceDetailsType;
      dispatch(slice.actions.setEcommerceInfoSuccess(ecommerceInfo));
    } catch (error: any) {
      console.warn("Issues deleting Stipe Card");
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

export function editEcommerceParams(
  token: string,
  supplierBusinessId: string,
  sellerName?: string,
  bannerImgHref?: string,
  categories?: string[],
  recProds?: string[],
  stylesJson?: string,
  shippingEnabled?: boolean,
  // shippingRuleVerifiedBy?: string,
  shippingThreshold?: number,
  shippingCost?: number |string,
  searchPlaceholder?: string |string,
  footerMsg?: string,
  footerCta?: string,
  footerPhone?: string,
  // footerIsWa?: boolean,
  footerEmail?: string,
  seoDescription?: string,
  seoKeywords?: string
  // defaultSupplierUnitId?: string,
  // commerceDisplay?: string,
  // accountActive?: boolean,
  // currency?: string,
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      // data validation
      if (!supplierBusinessId) {
        throw new Error("Supplier Business ID is undefined");
      }
      let categoriesString = null;
      if (categories !== undefined) {
        // convert categories in string with , like separate
        categoriesString = categories.join(",");
      }
      let recProdsString = null;
      if (recProds !== undefined) recProdsString = recProds.join(",");
      if (typeof(shippingCost) === "string"){
        shippingCost = parseFloat(shippingCost);
      }
      if (typeof(shippingThreshold) === "string"){
        shippingThreshold = parseFloat(shippingThreshold);
      }
      const { data, error } = await graphQLFetch({
        query: UPDATE_ECOMMERCE_PARAMS,
        headers: {
          Authorization: `supplybasic ${token}`,
        },
        variables: {
          supplierBusinessId,
          sellerName,
          bannerImgHref,
          categories: categoriesString,
          recProds: recProdsString,
          stylesJson,
          shippingEnabled,
          // shippingRuleVerifiedBy,
          shippingThreshold,
          shippingCost,
          searchPlaceholder,
          footerMsg,
          footerCta,
          footerPhone,
          // footerIsWa,
          footerEmail,
          seoDescription,
          seoKeywords,
          // defaultSupplierUnitId,
          // commerceDisplay,
          // accountActive,
          // currency,
        },
      });
      if (error) {
        throw error;
      }
      if (
        !data ||
        !data?.updateEcommerceSellerInfo ||
        data?.updateEcommerceSellerInfo?.code > 0
      ) {
        throw new Error("Data is undefined");
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
