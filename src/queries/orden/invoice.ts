export const GET_INVOICE_DETAILS = `query getInvoiceDetails($ordenId: UUID!) {
  getInvoiceDetails(ordenId: $ordenId) {
    ... on MxInvoiceGQL {
      invoiceNumber
      orden {
        ordenDetailsId
      }
      id
      satInvoiceUuid
      status
      total
      supplier {
        id
        name
      }
      xmlFile
      pdfFile
      restaurantBranch {
        id
        branchName
        fullAddress
      }
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const UPLOAD_INVOICE_FILES = "";
// `mutation uploadRestoInvoice($pdf: Upload!, $xml: Upload!, $ordenId: UUID!) {
//   uploadInvoice(ordenId: $ordenId, pdfFile: $pdf, xmlFile: $xml) {
//     ... on MxInvoiceError {
//       code
//     }
//     ... on MxUploadInvoiceMsg {
//       msg
//       success
//     }
//   }
// }`;

export const TRIGGER_GENERATE_INVOICE = `mutation generateFactura($ordenId: UUID!) {
  createSupplierInvoice(ordenId: $ordenId) {
    ... on SupplierInvoiceTriggerInfo {
      id
      ordenDetailsId
      executionStart
      executionEnd
      result
      status
    }
    ... on SupplierInvoiceError {
      code
      msg
    }
  }
}`;

export const CANCEL_INVOICE = `mutation cancelFactura($ordenId: UUID!) {
  cancelCustomerInvoice(ordenId: $ordenId) {
    ... on InvoiceStatus {
      id
      canceled
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const FETCH_INVOICE_EXEC_STATUS = `query getInvoiceExecStatus($ordenId: UUID!) {
  getSupplierInvoiceExecutionStatus(ordenId: $ordenId) {
    ... on SupplierInvoiceTriggerInfo {
      id
      ordenDetailsId
      executionStart
      executionEnd
      result
      status
    }
    ... on SupplierInvoiceError {
      msg
      code
    }
  }
}`;

export const GET_MULTIPLE_INVOICES = `query getInvoices($ordenIds: [UUID!]!) {
  getInvoices(ordenIds: $ordenIds) {
    ... on MxInvoiceGQL {
      id
      ordenId
      folio: invoiceNumber
      uuid: satInvoiceUuid
      status
      total
      invoiceType
      supplier {
        id
        name
        active
        notificationPreference
      }
      orden {
        ordenDetailsId
      }
      client: restaurantBranch {
        id
        branchName
        fullAddress
      }
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const GET_INVOICES_BY_ORDEN = `query getInvoicesByOrden($ordenId: UUID!) {
  getInvoiceDetailsByOrdenSupply(ordenId: $ordenId) {
    ... on MxInvoiceGQL {
      id
      ordenId
      folio: invoiceNumber
      uuid: satInvoiceUuid
      status
      total
      xmlFile
      pdfFile
      createdAt
      supplier {
        id
        name
        active
        notificationPreference
      }
      orden {
        ordenDetailsId
      }
      client: restaurantBranch {
        id
        branchName
        fullAddress
      }
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const FIND_INVOICES_BY_RANGE = `query findInvoices($suId: UUID!, $from: Date, $until: Date, $receiver: String, $page: Int = 1, $pageSize: Int = 20) {
  getInvoiceDetailsByDates(
    supplierUnitId: $suId
    fromDate: $from
    untilDate: $until
    receiver: $receiver
    page: $page
    pageSize: $pageSize
  ) {
    ... on MxInvoiceGQL {
      id
      invoiceNumber
      satInvoiceUuid
      ordenId
      status
      total
      pdfFile
      xmlFile
      createdAt
      restaurantBranch {
        id
        branchName
        fullAddress
      }
      supplier {
        id
        name
      }
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const EXPORT_INVOICES_BY_RANGE = `query exportInvoiceReport($suId: UUID!, $xformat: String!,$from: Date, $until: Date, $receiver: String, $page: Int = 1, $pageSize: Int = 20) {
  exportInvoiceDetailsByDates(
    supplierUnitId: $suId
    exportFormat: $xformat
    fromDate: $from
    untilDate: $until
    receiver: $receiver
    page: $page
    pageSize: $pageSize
  ) {
    ... on ExportMxInvoiceGQL {
      extension
      file
    }
    ... on MxInvoiceError {
      code
      msg
    }
  }
}`;

export const SEND_CONSOLIDATED_INVOICE = `mutation MyMutation($ordenIds: [UUID!]!, $paymethod: PayMethodType!) {
  createConsolidatedSupplierInvoice(
    ordenIds: $ordenIds
    paymentMethod: $paymethod
  ) {
    ... on CustomerMxInvoiceGQL {
      satId
      pdf
      issueDate
      total
      xml
    }
    ... on SupplierInvoiceError {
      code
      msg
    }
  }
}`;
