export const NEW_BUSINESS = `mutation newSupplierBusiness($bizType: SupplierBusinessType!, $email: String!, $phone: String!, $policy: String!, $country: String!, $name: String!, $website: String, $minOrder: MinimumOrderValueInput) {
    newSupplierBusiness(
      account: {businessType: $bizType, email: $email, phoneNumber: $phone, website: $website, minimumOrderValue: $minOrder, policyTerms: $policy}
      country: $country
      name: $name
      notificationPreference: WHATSAPP
    ) {
      ... on SupplierBusinessGQL {
        id
        businessName: name
        active
        account {
          businessType
          email
          phoneNumber
          website
        }
      }
      ... on SupplierBusinessError {
        code
      }
    }
  }`;

export const GET_BUSINESS = `query getSupBiz {
  getSupplierBusinessFromToken {
    ... on SupplierBusinessGQL {
      id
      businessName: name
      active
      logoUrl
      account {
        businessType
        email
        phoneNumber
        website
        incorporationFile
        legalRepId
        legalRepName
        legalBusinessName
        mxSatRegimen
        mxSatRfc
        mxZipCode
        mxSatCsf
        defaultCommertialConditions {
          policyTerms
          minimumOrderValue {
            amount
            measure
          }
          allowedPaymentMethods
          accountNumber
        }
      }
    }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const UPDATE_BUSINESS_INFO = `mutation updateSupplierBusiness($supBusId: UUID!, $bizType: SupplierBusinessType, $email: String, $phone: String, $policy: String, $country: String, $name: String, $website: String, $minOrder: MinimumOrderValueInput) {
  updateSupplierBusiness(
    supplierBusinessId: $supBusId
    account: {businessType: $bizType, email: $email, phoneNumber: $phone, website: $website, minimumOrderValue: $minOrder, policyTerms: $policy}
    country: $country
    name: $name
    notificationPreference: WHATSAPP
  ) {
    ... on SupplierBusinessGQL {
      id
      businessName: name
      active
      account {
        businessType
        email
        phoneNumber
        website
      }
    }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const ADD_SUPPLIER_BUSINESS_IMAGE = `mutation addSupplierBusinessImage($supBusId: UUID!, $imgFile: Upload!) {
  addSupplierBusinessImage(
    supplierBusinessId: $supBusId
    imgFile: $imgFile
  ) {
    ... on SupplierBusinessImageStatus {
      status
      }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const DELETE_SUPPLIER_BUSINESS_IMAGE = `mutation addSupplierBusinessImage($supBusId: UUID!) {
  deleteSupplierBusinessImage(
    supplierBusinessId: $supBusId
  ) {
    ... on SupplierBusinessImageStatus {
      status
      }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const UPDATE_LEGAL_INFO = `mutation updateSupLegalInfo($supBusId: UUID!, $legalName: String, $legalRep: String, $legalRepId: Upload, $incorpFile: Upload, $csfFile: Upload, $zipCode: String, $satRfc: String, $fiscalRegime: String) {
  updateSupplierBusiness(
    supplierBusinessId: $supBusId
    account: {legalBusinessName: $legalName, legalRepName: $legalRep, legalRepId: $legalRepId, incorporationFile: $incorpFile, mxSatCsf: $csfFile, mxZipCode: $zipCode, mxSatRfc: $satRfc, mxSatRegimen: $fiscalRegime}
  ) {
    ... on SupplierBusinessGQL {
      id
      businessName: name
      active
      account {
        businessType
        email
        phoneNumber
        website
      }
    }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const SET_SUPPLIER_MARKETPLACE_VISIBILITY = `mutation setSupplierMarketplaceVisibility($supBusId: UUID!, $displayMkt: Boolean) {
  updateSupplierBusiness(
    supplierBusinessId: $supBusId
    account: {displaysInMarketplace: $displayMkt}
  ) {
    ... on SupplierBusinessGQL {
      id
      businessName: name
      active
      account {
        businessType
        email
        phoneNumber
        website
      }
    }
    ... on SupplierBusinessError {
      code
    }
  }
}`;

export const GET_ALIMA_ACCOUNT = `query getSupplierAlimaAccount {
  getSupplierAlimaAccountFromToken {
    ... on SupplierAlimaAccount {
      supplierBusinessId
      activeCedis
      displayedInMarketplace
      account {
        id
        accountName
        customerType
        createdAt
        activeCedis
      }
      charges {
        id
        chargeType
        chargeAmount
        chargeAmountType
        currency
        createdAt
        chargeDescription
        active
      }
      paymentMethods {
        id
        paymentType
        paymentProvider
        paymentProviderId
        bankName
        accountName
        accountNumber
        createdBy
        providerData
      }
      discounts {
        id
        chargeId
        chargeDiscountAmount
        chargeDiscountAmountType
        chargeDiscountDescription
        validUpto
      }
    }
    ... on SupplierAlimaAccountError {
      code
      msg
    }
  }
}`;

export const CREATE_ALIMA_ACCOUNT = `mutation createSupplierAccount($plan: AlimaAccountPlan!) {
  createSupplierAlimaAccountFromToken(
    accountName: $plan
    activeCedis: 1
    paymentMethod: CARD_STRIPE
  ) {
    ... on SupplierAlimaAccount {
      supplierBusinessId
      activeCedis
      displayedInMarketplace
      account {
        id
        accountName
        customerType
        createdAt
        activeCedis
      }
      charges {
        id
        chargeType
        chargeAmount
        chargeAmountType
        currency
        createdAt
        chargeDescription
        active
      }
      paymentMethods {
        id
        paymentType
        paymentProvider
        paymentProviderId
        bankName
        accountName
        accountNumber
        createdBy
        providerData
      }
      discounts {
        id
        chargeId
        chargeDiscountAmount
        chargeDiscountAmountType
        chargeDiscountDescription
        validUpto
      }
    }
    ... on SupplierAlimaAccountError {
      msg
      code
    }
  }
}`;

export const GET_ALIMA_HISTORIC_INVOICES = `query getSupplierHistoricInvoices {
  getSupplierAlimaHistoricInvoices {
    ... on SupplierAlimaHistoricInvoices {
      supplierInvoices {
        invoice {
          id
          invoiceFiles
          invoiceName
          invoiceNumber
          createdAt
          currency
          taxInvoiceId
          total
          status
        }
        invoiceCharges {
          id
          chargeType
          chargeBaseQuantity
          chargeAmount
          chargeAmountType
          totalCharge
          currency
          createdAt
        }
        invoicePaystatus {
          id
          status
          createdAt
        }
      }
    }
    ... on SupplierAlimaAccountError {
      code
    }
  }
}`;

export const GET_ALIMA_ACCOUNT_SAAS_CONFIG = `query getSaaSAccountConfig {
  getSupplierAlimaAccountConfigFromToken {
    ... on SupplierAlimaAccountConfig {
      supplierBusinessId
      paidAccountId
      config
      createdAt
      lastUpdated
    }
    ... on SupplierAlimaAccountError {
      msg
      code
    }
  }
}`;