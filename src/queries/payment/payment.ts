export const GET_PAYSTATUS_DETAILS = `query getPayStatus($ordenId: UUID!) {
  getOrdenPaystatus(ordenId: $ordenId) {
    ... on OrdenPaystatusGQL {
      paystatus {
        id
        ordenId
        status
        createdAt
        createdBy
      }
      coreUser {
        id
        firstName
        lastName
        phoneNumber
        email
      }
      payReceipts {
        id
        paymentValue
        evidenceFile
        comments
        createdBy
        lastUpdated
        paymentDay
        ordenes {
          id
          deleted
          ordenId
          createdBy
          createdAt
          paymentComplement {
            id
            pdfFile
            satInvoiceUuid
            total
            xmlFile
          }
        }
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const UPDATE_PAYSTATUS = `mutation setPaymentStatus($ordenId: UUID!, $payStatus: PayStatusType!) {
  updateOrdenMarketplace(ordenId: $ordenId, paystatus: $payStatus) {
    ... on OrdenGQL {
      id
      paystatus {
        status
        createdAt
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const ADD_PAYMENT_RECEIPT = `mutation addPaymentReceipt($payment: Float!, $ordenIds: [UUID!]!, $comments: String, $receipt: Upload, $paymentComplement: Boolean, $paymentDay: Date) {
  addPaymentReceipt(
    ordenIds: $ordenIds
    paymentValue: $payment
    comments: $comments
    receiptFile: $receipt
    paymentDay: $paymentDay
    paymentComplement: $paymentComplement
  ) {
    ... on OrdenPaystatusGQL {
      paystatus {
        id
        ordenId
        status
        createdBy
        createdAt
      }
      payReceipts {
        id
        paymentValue
        evidenceFile
        comments
      }
    }
    ... on OrdenError {
      msg
      code
    }
  }
}`;


export const ADD_CONSOLIDATED_PAYMENT_RECEIPT = `mutation addConsolidatedPaymentReceipt($ordenes: [PaymentAmountInput!]!, $comments: String, $receipt: Upload, $paymentComplement: Boolean, $paymentDay: Date) {
  addConsolidatedPaymentReceipt(
    ordenes: $ordenes
    comments: $comments
    receiptFile: $receipt
    paymentDay: $paymentDay
    paymentComplement: $paymentComplement
  ) {
    ... on OrdenPaystatusGQL {
      paystatus {
        id
        ordenId
        status
        createdBy
        createdAt
      }
      payReceipts {
        id
        paymentValue
        evidenceFile
        comments
      }
    }
    ... on OrdenError {
      msg
      code
    }
  }
}`;

export const EDIT_PAYMENT_RECEIPT = `mutation editPaymentReceipt($prId: UUID!, $payment: Float, $ordenIds: [UUID!], $comments: String, $receipt: Upload,  $paymentComplement: Boolean, $paymentDay: Date) {
  editPaymentReceipt(
    paymentReceiptId: $prId,
    ordenIds: $ordenIds
    paymentValue: $payment
    comments: $comments
    receiptFile: $receipt
    paymentDay: $paymentDay
    paymentComplement: $paymentComplement
  ) {
    ... on OrdenPaystatusGQL {
      paystatus {
        id
        ordenId
        status
        createdBy
        createdAt
      }
      payReceipts {
        id
        paymentValue
        evidenceFile
        comments
      }
    }
    ... on OrdenError {
      msg
      code
    }
  }
}`;


export const GET_PAYMENT_DETAILS_BY_DATE = `query getPaymentDetailsByDates($suId: UUID!, $from: Date, $until: Date, $comments: String, $page: Int = 1, $pageSize: Int = 20) {
  getPaymentDetailsByDates(
    supplierUnitId: $suId
    fromDate: $from
    untilDate: $until
    comments: $comments
    page: $page
    pageSize: $pageSize
  ) {
    ... on PaymentReceiptGQL {
      id
      paymentValue
      evidenceFile
      createdAt
      comments
      lastUpdated
      paymentDay
      ordenes {
        id
        ordenId
        deleted
        createdAt
        paymentComplement {
          id
          pdfFile
          satInvoiceUuid
          total
          xmlFile
        }
      }
    }
    ... on OrdenError {
      code
      msg
    }
  }
}`;

export const EXPORT_PAYMENT_DETAILS_BY_DATE = `query exportPaymentDetailsByDates($suId: UUID!, $xformat: String!, $from: Date, $until: Date, $comments: String, $page: Int = 1, $pageSize: Int = 20) {
  exportPaymentDetailsByDates(
    supplierUnitId: $suId
    exportFormat: $xformat
    fromDate: $from
    untilDate: $until
    comments: $comments
    page: $page
    pageSize: $pageSize
  ) {
    ... on OrdenError {
      code
      msg
    }
    ... on ExportOrdenGQL {
      extension
      file
    }
  }
}`;