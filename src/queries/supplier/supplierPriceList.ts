export const GET_SUPPLIER_PRICE_LISTS = `query getSupUnitPriceLists($supUnitId: UUID!) {
    getSupplierUnitPriceLists(supplierUnitId: $supUnitId) {
      ... on SupplierPriceListsGQL {
        priceLists {
          id
          listName: name
          validUpto
          lastUpdated
          pricesDetails {
            sku
            sellUnit
            description
            price {
              supplierProductId
              price
              currency
            }
            images {
              id
              imageUrl
              priority
              createdAt
              lastUpdated
            }
          }
          isDefault
          clients {
            id
            branchName
            fullAddress
            deleted
          }
        }
      }
      ... on SupplierPriceListError {
        code
      }
    }
  }`;

  export const GET_SUPPLIER_PRODUCT_DEFAULT_PRICE_LISTS = `query getSupProductDefaultPriceLists($supProdId: UUID!) {
    getSupplierProductDefaultPriceLists(supplierProductId: $supProdId) {
      ... on SupplierUnitDefaultPriceListsGQL {
        units {
          unitName
        }
      }
      ... on SupplierPriceListError {
        code
      }
    }
  }`;
