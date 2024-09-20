export const GET_UNIT_CATEGS = `query getSupCategories {
    getCategories(categoryType:SUPPLIER) {
      ...on Category {
        label: name
        value: id
      }
      ... on CategoryError {
        code
      }
    }
  }`;

export const NEW_UNIT = `mutation newSupUnit($supBId: UUID!, $name: String!, $street: String!, $extN: String!, $intN: String!, $neigh: String!, $city: String!, $estate: String!, $country: String!, $zipCode: String!, $categoryId: UUID!, $fAddress: String!, $delivOpts: SupplierUnitDeliveryOptionsInput!, $accountNumber: String!, $paymethods: [PayMethodType!]!) {
  newSupplierUnit(
    supplierBusinessId: $supBId
    unitName: $name
    street: $street
    externalNum: $extN
    internalNum: $intN
    neighborhood: $neigh
    city: $city
    state: $estate
    country: $country
    zipCode: $zipCode
    categoryId: $categoryId
    fullAddress: $fAddress
    deliveryOptions: $delivOpts
    accountNumber: $accountNumber
    allowedPaymentMethods: $paymethods
  ) {
    ... on SupplierUnitGQL {
      id
      unitName
      unitCategory {
        supplierCategoryId
      }
      street
      externalNum
      internalNum
      neighborhood
      city
      estate: state
      country
      zipCode
      accountNumber
      allowedPaymentMethods
    }
    ... on SupplierUnitError {
      code
    }
  }
}`;

export const NEW_AND_EDIT_UNIT_TAX = `mutation upsertSupplierUnitTaxInfo($rfc: String!, $legalName: String!, $cerFile: Upload!, $keyFile: Upload!, $passcode: String!, $invoicePayType: String!, $invoiceTriggerType: String!, $fiscalRegime: RegimenSat!, $supUnitId: UUID!, $taxZipCode: String!) {
  upsertSupplierCsd(
    rfc: $rfc
    legalName: $legalName
    cerFile: $cerFile
    keyFile: $keyFile
    satPassCode: $passcode
    invoiceType: $invoicePayType
    invoicingType: $invoiceTriggerType
    satRegime: $fiscalRegime
    supplierUnitId: $supUnitId
    zipCode: $taxZipCode
  ) {
    ... on MxSatCertificateGQL {
      mxSatCertificate {
        supplierUnitId
        rfc
        satRegime
        taxZipCode: zipCode
        invoicingOptions {
          automatedInvoicing
          consolidation
          invoiceType
          triggeredAt
        }
        cerFile
        keyFile
        satPassCode
        legalName
      }
    }
    ... on MxSatCertificateError {
      code
    }
  }
}`;

export const GET_UNITS = `query getSupUnits {
  getSupplierUnitsFromToken {
    ... on SupplierUnitGQL {
      id
      fullAddress
      unitName
      deleted
      accountNumber
      allowedPaymentMethods
      unitCategory {
        supplierCategoryId
      }
      deliveryInfo {
        sellingOption
        regions
        deliveryTimeWindow
        cutoffTime
        warningTime
        serviceHours {
          dow
          end
          start
        }
      }
    }
    ... on SupplierUnitError {
      code
    }
  }
}`;

export const GET_UNIT_BY_ID = `query getSupUnitById($unitId: UUID!) {
  getSupplierUnitsFromToken(supplierUnitId: $unitId) {
    ... on SupplierUnitGQL {
      id
      street
      externalNum
      internalNum
      neighborhood
      city
      estate: state
      country
      zipCode
      fullAddress
      unitName
      deleted
      accountNumber
      allowedPaymentMethods
      unitCategory {
        supplierCategoryId
      }
      taxInfo {
        rfc
        invoicingOptions {
          automatedInvoicing
          consolidation
          invoiceType
          triggeredAt
        }
        cerFile
        keyFile
        legalName
        satPassCode
        satRegime
        taxZipCode: zipCode
      }
      deliveryInfo {
        sellingOption
        cutoffTime
        warningTime
        deliveryTimeWindow
        regions
        serviceHours {
          dow
          end
          start
        }
      }
    }
    ... on SupplierUnitError {
      code
    }
  }
}`;

export const EDIT_UNIT = `mutation updateSupUnit($supUnitId: UUID!, $name: String, $street: String, $extN: String, $intN: String, $neigh: String, $city: String, $estate: String, $country: String, $zipCode: String, $categoryId: UUID, $fAddress: String, $delivOpts: SupplierUnitDeliveryOptionsInput, $accountNumber: String, $paymethods: [PayMethodType!]!) {
  updateSupplierUnit(
    supplierUnitId: $supUnitId
    unitName: $name
    street: $street
    externalNum: $extN
    internalNum: $intN
    neighborhood: $neigh
    city: $city
    state: $estate
    country: $country
    zipCode: $zipCode
    categoryId: $categoryId
    fullAddress: $fAddress
    deliveryOptions: $delivOpts
    accountNumber: $accountNumber
    allowedPaymentMethods: $paymethods
  ) {
    ... on SupplierUnitGQL {
      id
      unitName
      unitCategory {
        supplierCategoryId
      }
      street
      externalNum
      internalNum
      neighborhood
      city
      estate: state
      country
      zipCode
      accountNumber
      allowedPaymentMethods
    }
    ... on SupplierUnitError {
      code
    }
  }
}`;

export const DELETE_UNIT = `mutation deleteSupUnit($supUnitId: UUID!, $delete: Boolean) {
  updateSupplierUnit(
    supplierUnitId: $supUnitId
    deleted: $delete
  ) {
    ... on SupplierUnitGQL {
      id
      unitName
      unitCategory {
        supplierCategoryId
      }
      street
      externalNum
      internalNum
      neighborhood
      city
      estate: state
      country
      zipCode
    }
    ... on SupplierUnitError {
      code
    }
  }
}`;
