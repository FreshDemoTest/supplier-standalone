export const NEW_SUPPLIER_CLIENT = `mutation newSupRestClient($supUnitId: UUID!, $contactName: String!, $email: String!, $phoneNumber: String!, $name: String!, $street: String!, $extN: String!, $intN: String!, $neigh: String!, $city: String!, $estate: String!, $country: String!, $zipCode: String!, $fAddress: String!, $rTags: [RestaurantBranchTagInput!]) {
    newSupplierRestaurantCreation(
      supplierUnitId: $supUnitId
      name: $name
      contactName: $contactName
      email: $email
      phoneNumber: $phoneNumber
      branchName: $name
      street: $street
      externalNum: $extN
      internalNum: $intN
      neighborhood: $neigh
      city: $city
      state: $estate
      country: $country
      zipCode: $zipCode
      fullAddress: $fAddress
      tags: $rTags
    ) {
      ... on SupplierRestaurantCreationGQL {
        relation {
          id
          supplierUnitId
          restaurantBranchId
        }
        branch {
          restaurantBranch {
            id
            branchName
            fullAddress
          }
          category {
            restaurantCategoryId
          }
        }
      }
      ... on SupplierRestaurantError {
        code
      }
    }
  }`;

export const GET_CLIENT_CATEGS = `query getRestoCategories {
    getCategories(categoryType:RESTAURANT) {
      ...on Category {
        label: name
        value: id
      }
      ... on CategoryError {
        code
      }
    }
  }`;

export const GET_ACTIVE_CLIENTS = `query getActiveRestoClients($supUnitIds: [UUID!]!) {
    getSupplierRestaurants(supplierUnitIds: $supUnitIds) {
      ... on SupplierRestaurantCreationGQL {
        restaurantBusiness {
          name,
          id,
          active
        }
        restaurantBusinessAccount {
          businessType
          email
          phoneNumber
          contactName: legalRepName
        }
        relation {
          supplierUnitId
          restaurantBranchId
        }
        branch {
          restaurantBranch {
            id
            branchName
            fullAddress
          }
          category {
            restaurantCategoryId
          }
          taxInfo {
            taxId: mxSatId
          }
        }
        priceListName
      }
      ... on SupplierRestaurantError {
        code
      }
    }
  }`;

export const GET_CLIENT_PROFILE = `query getRestoClientProfile($supUnitId: UUID!, $branchId: UUID!) {
  getSupplierRestaurantProducts(
    supplierUnitId: $supUnitId
    restaurantBranchId: $branchId
  ) {
    ... on SupplierRestaurantCreationGQL {
      restaurantBusiness {
        id
        name
        country
        active
      }
      restaurantBusinessAccount {
        businessType
        email
        phoneNumber
        contactName: legalRepName
      }
      relation {
        supplierUnitId
        restaurantBranchId
        id
      }
      products {
        id
        sku
        unitMultiple
        productUuid: productId
        minQuantity
        estimatedWeight
        productDescription: description
        conversionFactor
        sellUnit
        taxAmount: tax
        iepsAmount: mxIeps
        lastPrice {
          amount: price
          id
          supplierProductId
          validUntil: validUpto
          unit: currency
        }
        stock {
          uuid: id 
          amount: availability
          unit: stockUnit
          keepSellingWithoutStock
          active
          createdAt
        }  
      }
      ecommerceUser {
        id
        disabled
        password
        firstName
        lastName
        phoneNumber
        email
      }
      branch {
        restaurantBranch {
          id
          branchName
          fullAddress
          street
          externalNum
          internalNum
          neighborhood
          city
          estate: state
          zipCode
          country
          deleted
        }
        category {
          restaurantCategoryId
        }
        taxInfo {
          taxId: mxSatId
          fiscalRegime: satRegime
          taxName: legalName
          taxAddress: fullAddress
          cfdiUse
          taxZipCode: zipCode
          invoiceEmail: email
        }
        invoicingOptions {
          invoiceType
          triggeredAt
        }
        tags {
          tagKey
          tagValue
        }
      }
    }
    ... on SupplierRestaurantError {
      code
    }
  }
}`;

export const UPDATE_SUPPLIER_CLIENT = `mutation udpateSupRestClient($supUnitId: UUID!, $branchId: UUID!, $srRelId: UUID!, $contactName: String!, $email: String!, $phoneNumber: String!, $name: String!, $street: String!, $extN: String!, $intN: String!, $neigh: String!, $city: String!, $estate: String!, $country: String!, $zipCode: String!, $fAddress: String!, $rTags: [RestaurantBranchTagInput!]) {
    updateSupplerRestaurant(
      supplierUnitId: $supUnitId
      restaurantBranchId: $branchId
      supplierRestaurantRelationId: $srRelId
      name: $name
      contactName: $contactName
      email: $email
      phoneNumber: $phoneNumber
      branchName: $name
      street: $street
      externalNum: $extN
      internalNum: $intN
      neighborhood: $neigh
      city: $city
      state: $estate
      country: $country
      zipCode: $zipCode
      fullAddress: $fAddress
      tags: $rTags
    ) {
      ... on SupplierRestaurantCreationGQL {
        relation {
          id
          supplierUnitId
          restaurantBranchId
        }
      }
      ... on SupplierRestaurantError {
        code
      }
    }
  }`;

  export const UPDATE_TAGS_CLIENT = `mutation udpateSupRestClient($supUnitId: UUID!, $branchId: UUID!, $srRelId: UUID!, $rTags: [RestaurantBranchTagInput!]) {
    updateSupplerRestaurant(
      supplierUnitId: $supUnitId
      restaurantBranchId: $branchId
      supplierRestaurantRelationId: $srRelId
      tags: $rTags
    ) {
      ... on SupplierRestaurantCreationGQL {
        relation {
          id
          supplierUnitId
          restaurantBranchId
        }
      }
      ... on SupplierRestaurantError {
        code
      }
    }
  }`;

export const UPSERT_CLIENT_TAX = `mutation insertNewClientTaxInfo($cfdi: CFDIUse!, $taxEmail: String!, $taxAddress: String!, $lName: String!, $RFC: String!, $branchId: UUID!, $satReg: RegimenSat!, $taxZip: String!, $invoicePayType: String!, $invoiceTriggerType: String!) {
  upsertSupplierRestaurantTaxInfo(
    cfdiUse: $cfdi
    email: $taxEmail
    fullAddress: $taxAddress
    legalName: $lName
    mxSatId: $RFC
    restaurantBranchId: $branchId
    satRegime: $satReg
    zipCode: $taxZip
    invoicePayType: $invoicePayType
    invoiceTriggerType: $invoiceTriggerType
  ) {
    ... on RestaurantBranchMxInvoiceInfo {
      taxId: mxSatId
      fiscalRegime: satRegime
      taxName: legalName
      taxAddress: fullAddress
      cfdiUse
      taxZipCode: zipCode
      invoiceEmail: email
    }
    ... on RestaurantBranchError {
      code
    }
  }
}`;

export const EXPORT_CLIENTS_FILE = `query exportClientsFile($xformat: String!, $type: String!) {
  exportClientsFile(
    exportFormat: $xformat
    type: $type
  ) {
    ... on ExportSupplierRestaurantGQL {
      extension
      file
    }
    ... on SupplierRestaurantError {
      code
      msg
    }
  }
}`;

export const UPSERT_ASSIGNED_SUPPLIER_RESTAURANT = `mutation reAssignSupplier($restaurantBranchId: UUID!, $setSupplierUnitId: UUID!) {
  upsertAssignedSupplierRestaurant(
    restaurantBranchId: $restaurantBranchId
    setSupplierUnitId: $setSupplierUnitId
  ) {
    ... on SupplierRestaurantRelation {
      id
      supplierUnitId
      restaurantBranchId
    }
    ... on SupplierRestaurantError {
      code
    }
  }
}`;

export const NEW_ECOMMERCE_CLIENT = `mutation newEcommerceClientMutation($restaurantBranchId: UUID!, $email: String!) {
  newEcommerceRestaurantUser(
    restaurantBranchId: $restaurantBranchId
    email: $email
  ) {
    ... on IEcommerceUser {
      id
      disabled
      password
      firstName
      lastName
      phoneNumber
      email
    }
    ... on EcommerceUserError {
      msg
      code
    }
  }
}`;

export const EDIT_ECOMMERCE_CLIENT = `mutation newEcommerceClientMutation($restaurantBranchId: UUID!, $email: String!) {
  editEcommerceRestaurantUser(
    restaurantBranchId: $restaurantBranchId
    email: $email
  ) {
    ... on IEcommerceUser {
      id
      disabled
      password
      firstName
      lastName
      phoneNumber
      email
    }
    ... on EcommerceUserError {
      msg
      code
    }
  }
}`;