export const NEW_SUPPLIER_ORDEN = `mutation newSupplierOrden($supUnitId: UUID!, $paymethod: PayMethodType!, $cartProds: [CartProductInput!]!, $deliveryDate: DateTime!, $deliveryTime: DeliveryTimeWindowInput!, $supBId: UUID!, $restaurantBranchId: UUID!, $comms: String, $delivType: SellingOption!, $shipping: Float) {
  newOrdenMarketplace(
    cartProducts: $cartProds
    restaurantBranchId: $restaurantBranchId
    supplierUnitId: $supUnitId
    deliveryDate: $deliveryDate
    deliveryTime: $deliveryTime
    deliveryType: $delivType
    paystatus: UNPAID
    status: SUBMITTED
    supplierBusinessId: $supBId
    paymentMethod: $paymethod
    comments: $comms
    shippingCost: $shipping
  ) {
    ... on OrdenGQL {
      id
      status {
        status
      }
      details {
        version
      }
    }
    ... on OrdenError {
      code
    }
  }
}`;

export const GET_ACTIVE_ORDENES_BY_UNIT = `query getActiveOrdenesByUnit($fromDate: Date!, $untilDate: Date!, $unitId: UUID!) {
  getOrdenes(fromDate: $fromDate, toDate: $untilDate, supplierUnitId: $unitId) {
    ... on OrdenGQL {
      id
      ordenNumber
      cart {
        subtotal
        quantity
      }
      details {
        approvedBy
        ordenId
        version
        subtotal
        total
        paymentMethod
        deliveryDate
        createdAt
        deliveryTime {
          end
          start
        }
        deliveryType
        createdBy
        restaurantBranchId
      }
      status {
        status
        createdAt
      }
      ordenType
      paystatus {
        status
        createdAt
      }
      supplier {
        supplierBusiness {
          name
        }
        supplierUnit {
          id
          unitName
          fullAddress
        }
        supplierBusinessAccount {
          phoneNumber
          email
        }
      }
      branch {
        id
        branchName
        fullAddress
        branchCategory {
          restaurantCategoryId
        }
      }
    }
    ... on OrdenError {
      code
    }
  }
}`;

export const GET_ORDEN_DETAILS = `query getOrdenDetails($ordenId: UUID!) {
  getOrdenes(ordenId: $ordenId) {
    ... on OrdenGQL {
      id
      ordenNumber
      cart {
        unitPrice
        subtotal
        sellUnit
        quantity
        supplierProductPriceId
        suppProd {
          id
          sellUnit
          sku
          description
          minQuantity
          unitMultiple
          estimatedWeight
          taxAmount: tax
          iepAmount: mxIeps
        }
      }
      details {
        cartId
        approvedBy
        ordenId
        version
        total
        tax
        subtotalWithoutTax
        subtotal
        shippingCost
        serviceFee
        paymentMethod
        packagingCost
        discount
        deliveryDate
        createdAt
        deliveryTime {
          end
          start
        }
        deliveryType
        comments
        createdBy
        restaurantBranchId
        supplierUnitId
      }
      status {
        status
        createdAt
      }
      ordenType
      paystatus {
        status
        createdAt
      }
      supplier {
        supplierBusinessAccount {
          supplierBusinessId
          legalRepName
          email
          phoneNumber
        }
        supplierBusiness {
          name
        }
        unit: supplierUnit {
          id
          unitName
          fullAddress
        }
      }
      branch {
        id
        branchName
        fullAddress
      }
    }
    ... on OrdenError {
      code
    }
  }
}`;

export const UPDATE_SUPPLIER_ORDEN = `mutation updateSupplierOrden($ordenId: UUID!, $paymentMethod: PayMethodType,$cart: [CartProductInput!]!, $packaging: Float, $shipping: Float, $service: Float, $comments: String, $delivDate: Date, $delivTime: DeliveryTimeWindowInput, $delivType: SellingOption!) {
  updateOrdenMarketplace(
    ordenId: $ordenId
    cartProducts: $cart
    packagingCost: $packaging
    shippingCost: $shipping
    serviceFee: $service
    comments: $comments
    paymentMethod: $paymentMethod
    deliveryDate: $delivDate
    deliveryTime: $delivTime
    deliveryType: $delivType
  ) {
    ... on OrdenGQL {
      id
      status {
        status
      }
      details {
        version
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const UPDATE_SUPPLIER_ORDEN_PAYMENT_METHOD = `mutation updateSupplierOrden($ordenId: UUID!, $paymentMethod: PayMethodType) {
  updateOrdenMarketplace(
    ordenId: $ordenId
    paymentMethod: $paymentMethod
  ) {
    ... on OrdenGQL {
      id
      status {
        status
      }
      details {
        version
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;


export const REINVOICE_SUPPLIER_ORDEN = `mutation reInvoiceSupplierOrden($ordenId: UUID!, $paymentMethod: PayMethodType,$cart: [CartProductInput!]!, $packaging: Float, $shipping: Float, $service: Float, $comments: String, $delivDate: Date, $delivTime: DeliveryTimeWindowInput, $delivType: SellingOption!) {
  reInvoiceOrder(
    ordenId: $ordenId
    cartProducts: $cart
    packagingCost: $packaging
    shippingCost: $shipping
    serviceFee: $service
    comments: $comments
    paymentMethod: $paymentMethod
    deliveryDate: $delivDate
    deliveryTime: $delivTime
    deliveryType: $delivType
  ) {
    ... on OrdenGQL {
      id
      status {
        status
      }
      details {
        version
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const CANCEL_ORDEN = `mutation cancelOrden($ordenId: UUID!) {
  updateOrdenMarketplace(ordenId: $ordenId, status: CANCELED) {
    ... on OrdenGQL {
      id
      status {
        status
        createdAt
      }
      ordenType
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const CONFIRM_ORDEN = `mutation confirmOrden($ordenId: UUID!) {
  updateOrdenMarketplace(ordenId: $ordenId, status: ACCEPTED) {
    ... on OrdenGQL {
      id
      status {
        status
        createdAt
      }
      ordenType
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const DELIVER_ORDEN = `mutation deliverOrden($ordenId: UUID!) {
  updateOrdenMarketplace(ordenId: $ordenId, status: DELIVERED) {
    ... on OrdenGQL {
      id
      status {
        status
        createdAt
      }
      ordenType
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const EXPORT_HISTORIC_ORDENES = `query exportOrdenesByUnit($expFormat: String!, $fromDate: Date!, $toDate: Date!, $supUId: UUID) {
  exportOrdenes(
    exportFormat: $expFormat
    fromDate: $fromDate
    toDate: $toDate
    supplierUnitId: $supUId
    ordenType: NORMAL
  ) {
    ... on ExportOrdenGQL {
      extension
      file
    }
    ... on OrdenError {
      code
    }
  }
}`;

export const EXTERNAL_CONFIRM_ORDEN = `mutation extrenalConfirmOrden($ordenId: UUID!) {
  confirmOrden(ordenId: $ordenId) {
    ... on OrdenStatusConfirmMsg {
      msg
      status
    }
    ... on OrdenError {
      code
    }
  }
}`;


export const GET_EXT_ORDEN_DETAILS = `query getExtOrdenDetails($ordenId: UUID!) {
  getExternalOrden(ordenId: $ordenId) {
    ... on OrdenGQL {
      id
      ordenNumber
      cart {
        unitPrice
        subtotal
        sellUnit
        quantity
        supplierProductPriceId
        suppProd {
          id
          sellUnit
          sku
          description
          minQuantity
          unitMultiple
          estimatedWeight
        }
      }
      details {
        cartId
        approvedBy
        ordenId
        version
        total
        tax
        subtotalWithoutTax
        subtotal
        shippingCost
        serviceFee
        paymentMethod
        packagingCost
        discount
        deliveryDate
        createdAt
        deliveryTime {
          end
          start
        }
        comments
        createdBy
        restaurantBranchId
      }
      status {
        status
        createdAt
      }
      ordenType
      paystatus {
        status
        createdAt
      }
      supplier {
        supplierBusinessAccount {
          supplierBusinessId
          legalRepName
          email
          phoneNumber
        }
        supplierBusiness {
          name
        }
      }
      branch {
        branchName
        id
        fullAddress
        branchCategory {
          restaurantCategoryId
        }
        contactInfo {
          businessName
          displayName
          email
          phoneNumber
        }
      }
      cart {
        cartId
        supplierProductPriceId
        unitPrice
        subtotal
        comments
        createdBy
        createdAt
        lastUpdated
      }
    }
    ... on OrdenError {
      code
    }
  }
}`;