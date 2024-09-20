export const GET_ECOMMERCE_INFO = `query getEcommerceSellerInfoByToken {
  getEcommerceSellerInfoByToken
    {
      ... on EcommerceSeller {
        supplierBusinessId
        sellerName
        bannerImgHref
        categories
        recProds
        stylesJson
        shippingEnabled
        shippingRuleVerifiedBy
        shippingThreshold
        shippingCost
        searchPlaceholder
        footerMsg
        footerCta
        footerPhone
        footerIsWa
        footerEmail
        seoDescription
        seoKeywords
        defaultSupplierUnitId
        commerceDisplay
        currency
        ecommerceUrl
      }
      ... on EcommerceSellerError {
        code
      }
    }
  }`;

  export const UPDATE_ECOMMERCE_PARAMS = `mutation updateEcommerceSellerInfo(
    $supplierBusinessId: UUID!
    $sellerName: String
    $bannerImgHref: String
    $categories: String
    $recProds: String
    $stylesJson: String
    $shippingEnabled: Boolean
    $shippingRuleVerifiedBy: String
    $shippingThreshold: Float
    $shippingCost: Float
    $searchPlaceholder: String
    $footerMsg: String
    $footerCta: String
    $footerPhone: String
    $footerIsWa: Boolean
    $footerEmail: String
    $seoDescription: String
    $seoKeywords: String
    $defaultSupplierUnitId: UUID
    $commerceDisplay: String
    $currency: String
  ) {
    updateEcommerceSellerInfo(
      supplierBusinessId: $supplierBusinessId
      sellerName: $sellerName
      bannerImgHref: $bannerImgHref
      categories: $categories
      recProds: $recProds
      stylesJson: $stylesJson
      shippingEnabled: $shippingEnabled
      shippingRuleVerifiedBy: $shippingRuleVerifiedBy
      shippingThreshold: $shippingThreshold
      shippingCost: $shippingCost
      searchPlaceholder: $searchPlaceholder
      footerMsg: $footerMsg
      footerCta: $footerCta
      footerPhone: $footerPhone
      footerIsWa: $footerIsWa
      footerEmail: $footerEmail
      seoDescription: $seoDescription
      seoKeywords: $seoKeywords
      defaultSupplierUnitId: $defaultSupplierUnitId
      commerceDisplay: $commerceDisplay
      currency: $currency
    )
      {
        ... on EcommerceSeller {
          supplierBusinessId
          sellerName
          bannerImgHref
          categories
          recProds
          stylesJson
          shippingEnabled
          shippingRuleVerifiedBy
          shippingThreshold
          shippingCost
          searchPlaceholder
          footerMsg
          footerCta
          footerPhone
          footerIsWa
          footerEmail
          seoDescription
          seoKeywords
          defaultSupplierUnitId
          commerceDisplay
          currency
        }
        ... on EcommerceSellerError {
          code
        }
      }
    }`;

    export const ADD_ECOMMERCE_IMAGE = `mutation addEcommerceSellerImage($supBusId: UUID!, $imgFile: Upload!, $imgType: ImageType!) {
      addEcommerceSellerImage(
        supplierBusinessId: $supBusId
        imgFile: $imgFile
        imageType: $imgType
      ) {
        ... on EcommerceSellerImageStatus {
          status
          }
        ... on EcommerceSellerError {
          code
        }
      }
    }`;

    export const DELETE_ECOMMERCE_IMAGE = `mutation deleteEcommerceSellerImage($supBusId: UUID!, $imgType: ImageType!) {
      deleteEcommerceSellerImage(
        supplierBusinessId: $supBusId
        imageType: $imgType
      ) {
        ... on EcommerceSellerImageStatus {
          status
          }
        ... on EcommerceSellerError {
          code
        }
      }
    }`;