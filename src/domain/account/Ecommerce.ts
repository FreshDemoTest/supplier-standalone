export type EcommerceDetailsType = {
    supplierBusinessId: string
    sellerName: string
    bannerImgHref?: string
    categories?: string[]
    recProds?: string[]
    stylesJson?: string
    shippingEnabled?: boolean
    shippingRuleVerifiedBy?: string
    shippingThreshold?: number
    shippingCost?: number
    searchPlaceholder?: string
    footerMsg?: string
    footerCta?: string
    footerPhone?: string
    footerIsWa?: boolean
    footerEmail?: string
    seoDescription?: string
    seoKeywords?: string
    defaultSupplierUnitId?: string
    commerceDisplay?: string
    currency?: string
    ecommerceUrl?: string
  };