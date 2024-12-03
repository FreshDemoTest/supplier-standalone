export const UPLOAD_BATCH_SUPPLIER_PRODUCTS = `mutation uploadSupProds($productfile: Upload!) {
  upsertSupplierProductsByFile(productFile: $productfile) {
    ... on SupplierProductsBatchGQL {
      resMsg: msg
      products {
        supplierProductId
        status
        sku
        productId
        msg
        description
      }
    }
    ... on SupplierProductError {
      code
    }
  }
}`;

export const GET_SUPPLIER_PRODUCT_CATALOG = `query getSupplierProds {
  getSupplierProductsByToken {
    ... on SupplierProductsDetailsListGQL {
      products {
        id
        productUuid: productId
        upc
        sku
        productDescription: description
        sellUnit
        buyUnit
        conversionFactor
        minimumQuantity: minQuantity
        unitMultiple
        estimatedWeight
        price: lastPrice {
          uuid: id
          amount: price
          unit: currency
          validUntil: validUpto
        }
        tags {
          tagKey
          tagValue
        }
        stock {
          uuid: id
          amount: stock
          unit: stockUnit
        }
        taxAmount: tax
        satProductCode: taxId
        satUnitCode: taxUnit
        images {
          id
          imageUrl
          priority
          createdAt
          lastUpdated
        }
      }
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const GET_SUPPLIER_PRODUCT_STOCK = `query getProductStock($suId: UUID!) {
  getSupplierProductsStock(supplierUnitId: $suId) {
    ... on SupplierProductsDetailsListGQL {
      products {
        id
        sku
        productDescription: description
        sellUnit
        buyUnit
        unitMultiple
        stock {
          uuid: id
          amount: stock
          unit: stockUnit
          keepSellingWithoutStock
          active
          createdAt
          availability
        }
        images {
          id
          imageUrl
          priority
          createdAt
          lastUpdated
        }
      }
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const GET_SUPPLIER_PRODUCT_DETAILS = `query getProduct($spId: UUID!) {
  getSupplierProduct(supplierProductId: $spId) {
    ... on SupplierProductsDetailsListGQL {
      products {
        id
        productUuid: productId
        upc
        sku
        productDescription: description
        sellUnit
        buyUnit
        conversionFactor
        minimumQuantity: minQuantity
        unitMultiple
        estimatedWeight
        longDescription
        iepsAmount: mxIeps 
        price: lastPrice {
          uuid: id
          amount: price
          unit: currency
          validUntil: validUpto
        }
        stock {
          uuid: id
          amount: stock
          unit: stockUnit
        }
        taxAmount: tax
        taxId
        taxUnit
        tags {
          tagKey
          tagValue
        }
        images {
          id
          imageUrl
          priority
          createdAt
          lastUpdated
        }
      }
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const UPLOAD_BATCH_SUPPLIER_PRICE_LIST = `mutation uploadSupplierPriceList($listName: String!, $pricelistfile: Upload!, $isDefault: Boolean!, $resBranches: [UUID!]!, $supUnitIds: [UUID!]!, $validUntil: Date!) {
  upsertSupplierPriceListByFile(
    name: $listName
    priceListFile: $pricelistfile
    isDefault: $isDefault
    restaurantBranchIds: $resBranches
    supplierUnitIds: $supUnitIds
    validUntil: $validUntil
  ) {
    ... on SupplierPriceListBatchGQL {
      resMsg: msg
      prices {
        supplierProductId
        supplierProductPriceId
        productId
        description
        sku
        status
        msg
      }
    }
    ... on SupplierPriceListError {
      code
    }
  }
}`;

export const UPLOAD_BATCH_SUPPLIER_PRODUCT_STOCK = `mutation upsertSupplierProductsStockByFileMutation($productStockFile: Upload!, $supUnitIds: [UUID!]!) {
  upsertSupplierProductsStockByFile(
    productStockFile: $productStockFile
    supplierUnitIds: $supUnitIds
  ) {
    ... on SupplierProductsBatchStockGQL {
      resMsg: msg
      stock {
        supplierProductId
        description
        sku
        stock
        keepSellingWithoutStock
        status
        msg
      }
    }
    ... on SupplierProductError {
      code
    }
  }
}`;

export const GET_PRODUCT_CATEGS = `query getProdCategories {
  getCategories(categoryType:PRODUCT) {
    ...on Category {
      label: name
      value: id
    }
    ... on CategoryError {
      code
    }
  }
}`;

export const SEARCH_SAT_CODES = `query searchSATCodes(
    $searchStr: String
    $currentPg: Int = 1
    $pgSz: Int = 100
  ) {
  getProductSATCodes(pageSize: $pgSz, currentPage: $currentPg, search: $searchStr) {
    ... on ProductFamilyError {
      code
      msg
    }
    ... on MxSatProductCodeGQL {
      satCode
      satCodeFamily
      satDescription
    }
  }
}`;

export const NEW_SUPPLIER_PRODUCT = `mutation addNewSupplierProd($description: String!, $buyUnit: UOMType!, $conversionFactor: Float!, $minQuantity: Float!, $sellUnit: UOMType!, $sku: String!, $supplierBusinessId: UUID!, $tax: Float!, $taxId: String!, $unitMultiple: Float!, $defaultPrice: Float, $estimatedWeight: Float, $productId: UUID, $upc: String, $sTags: [SupplierProductTagInput!], $longDes: String, $iepsAmount: Float) {
  newSupplierProduct(
    description: $description
    longDescription: $longDes
    buyUnit: $buyUnit
    conversionFactor: $conversionFactor
    minQuantity: $minQuantity
    sellUnit: $sellUnit
    sku: $sku
    supplierBusinessId: $supplierBusinessId
    tax: $tax
    taxId: $taxId
    unitMultiple: $unitMultiple
    defaultPrice: $defaultPrice
    estimatedWeight: $estimatedWeight
    productId: $productId
    upc: $upc
    tags: $sTags
    mxIeps: $iepsAmount
  ) {
    ... on SupplierProductsDetailsListGQL {
      products {
        id
        productId
        sku
        productDescription: description
      }
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const UPDATE_SUPPLIER_PRODUCT = `mutation updateSupProduct($description: String!, $buyUnit: UOMType!, $conversionFactor: Float!, $minQuantity: Float!, $sellUnit: UOMType!, $sku: String!, $supplierProductId: UUID!, $tax: Float!, $taxId: String!, $unitMultiple: Float!, $defaultPrice: Float, $estimatedWeight: Float, $productId: UUID, $upc: String, $sTags: [SupplierProductTagInput!], $longDes: String, $iepsAmount: Float) {
  editSupplierProduct(
    supplierProductId: $supplierProductId
    description: $description
    longDescription: $longDes
    buyUnit: $buyUnit
    conversionFactor: $conversionFactor
    minQuantity: $minQuantity
    sellUnit: $sellUnit
    sku: $sku
    tax: $tax
    taxId: $taxId
    unitMultiple: $unitMultiple
    defaultPrice: $defaultPrice
    estimatedWeight: $estimatedWeight
    productId: $productId
    upc: $upc
    tags: $sTags
    mxIeps: $iepsAmount
  ) {
    ... on SupplierProductsDetailsListGQL {
      products {
        id
        productId
        sku
        productDescription: description
      }
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const CREATE_NEW_SUPPLIER_PRICE_LIST = `mutation createSupplierPriceList($listName: String!, $priceDetailsList: [SupplierPriceInput!]!, $isDefault: Boolean!, $resBranches: [UUID!]!, $supUnitIds: [UUID!]!, $validUntil: Date!) {
  newSupplierPriceList(
    name: $listName
    isDefault: $isDefault
    restaurantBranchIds: $resBranches
    supplierUnitIds: $supUnitIds
    validUntil: $validUntil
    supplierProductPrices: $priceDetailsList
  ) {
    ... on SupplierPriceListBatchGQL {
      resMsg: msg
      prices {
        supplierProductId
        supplierProductPriceId
        productId
        description
        sku
        status
        msg
      }
    }
    ... on SupplierPriceListError {
      code
      msg
    }
  }
}`;

export const UPDATE_SUPPLIER_PRICE_LIST = `mutation editSupplierPriceList($listName: String!, $priceDetailsList: [SupplierPriceInput!]!, $isDefault: Boolean!, $resBranches: [UUID!]!, $supUnitIds: [UUID!]!, $validUntil: Date!) {
  editSupplierPriceList(
    name: $listName
    isDefault: $isDefault
    restaurantBranchIds: $resBranches
    supplierUnitIds: $supUnitIds
    validUntil: $validUntil
    supplierProductPrices: $priceDetailsList
  ) {
    ... on SupplierPriceListBatchGQL {
      resMsg: msg
      prices {
        supplierProductId
        supplierProductPriceId
        productId
        description
        sku
        status
        msg
      }
    }
    ... on SupplierPriceListError {
      code
      msg
    }
  }
}`;

export const ADD_SUPPLIER_PRODUCT_IMAGE = `mutation addSupplierImage($imgFile: Upload!, $supProdId: UUID!) {
  newSupplierProductImage(image: $imgFile, supplierProductId: $supProdId) {
    ... on SupplierProductImage {
      id
      imageUrl
      priority
      createdAt
      lastUpdated
    }
    ... on SupplierProductImageError {
      code
      msg
    }
  }
}`;

export const EXPORT_PRODUCTS_FILE = `query exportProductsFile($xformat: String!, $type: String!, $receiver: String) {
  exportProductsFile(
    exportFormat: $xformat
    receiver: $receiver
    type: $type
  ) {
    ... on ExportProductGQL {
      extension
      file
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const EXPORT_PRODUCTS_STOCK_FILE = `query exportProductsStockFile($xformat: String!, $type: String!, $supplierUnitId: UUID! $receiver: String) {
  exportProductsFile(
    exportFormat: $xformat
    receiver: $receiver
    supplierUnitId: $supplierUnitId
    type: $type
  ) {
    ... on ExportProductGQL {
      extension
      file
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const CREATE_NEW_SUPPLIER_STOCK_LIST = `mutation createSupplierStockList($supplierProductStock: [SupplierProductStockInput!]!, $supUnitIds: [UUID!]!) {
  newSupplierStockList(
    supplierUnitIds: $supUnitIds
    supplierProductStock: $supplierProductStock
  ) {
    ... on SupplierProductsBatchStockGQL {
      resMsg: msg
      stock {
        supplierProductId
        description
        sku
        stock
        keepSellingWithoutStock
        status
        msg
      }
    }
    ... on SupplierProductError {
      code
    }
  }
}`;

export const EXPORT_ALL_PRICE_LIST_FILE = `query exportProductsFile($suId: UUID!, $xformat: String!, $type: String!) {
  exportProductsFile(
    supplierUnitId: $suId
    exportFormat: $xformat
    type: $type
  ) {
    ... on ExportProductGQL {
      extension
      file
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const EXPORT_PRICE_LIST_FILE = `query exportProductsFile($suId: UUID!, $xformat: String!, $type: String!, $priceListId: UUID) {
  exportProductsFile(
    supplierUnitId: $suId
    exportFormat: $xformat
    type: $type,
    supplierProductPriceListId: $priceListId
  ) {
    ... on ExportProductGQL {
      extension
      file
    }
    ... on SupplierProductError {
      code
      msg
    }
  }
}`;

export const UPDATE_SUPPLIER_PRODUCT_IMAGE = `mutation updateSupplierImage($imgFile: Upload!, $imgId: UUID!) {
  editSupplierProductImage(image: $imgFile, supplierProductImageId: $imgId) {
    ... on SupplierProductImage {
      id
      imageUrl
      priority
      createdAt
      lastUpdated
    }
    ... on SupplierProductImageError {
      code
      msg
    }
  }
}`;

export const DELETE_SUPPLIER_PRODUCT_IMAGE = `mutation deleteSupplierImage($imgId: UUID!) {
  deleteSupplierProductImage(supplierProductImageId: $imgId) {
    ... on SupplierProductImageError {
      code
      msg
    }
    ... on SupplierImageMsg {
      msg
      status
    }
  }
}`;

export const REORDER_SUPPLIER_PRODUCT_IMAGES = `mutation reorderSupplierImages($supProdId: UUID!, $imgs: [SupplierProductImageInput!]!) {
  reorganizeSupplierProductImage(
    supplierProductId: $supProdId
    supplierProductImagesInput: $imgs
  ) {
    ... on SupplierProductImage {
      id
      imageUrl
      priority
      createdAt
      lastUpdated
    }
    ... on SupplierProductImageError {
      code
      msg
    }
  }
}`;

export const DELETE_SUPPLIER_PRICE_LIST = `mutation deleteSupplierPriceList($priceListId: UUID!, $unitId: UUID!) {
  deleteSupplierPriceList(
    supplierProductPriceListId: $priceListId
    unitId: $unitId
  ) {
    ... on DeleteSupplierPriceListStatus {
      msg
    }
    ... on SupplierPriceListError {
      code
      msg
    }
  }
}`;

export const UPDATE_ONE_SUPPLIER_PRICE_LIST = `mutation editProductSupplierPriceList($priceListId: UUID!, $priceId: UUID!, $price:Float!) {
  editProductSupplierPriceList(
    supplierPriceListId: $priceListId
    supplierProductPriceId: $priceId
    price: $price
  ) {
    ... on UpdateOneSupplierPriceListStatus {
      msg
    }
    ... on SupplierPriceListError {
      code
      msg
    }
  }
}`;