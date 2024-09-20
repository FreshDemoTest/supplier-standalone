import { paymentMethodType } from "../orden/Orden";

export const minOrdenUnits = {
  kg: "Kgs",
  pesos: "Pesos ($)",
  products: "Productos",
};

export type BusinessType = {
  id?: string;
  businessName: string;
  businessType: string;
  email: string;
  phoneNumber: string;
  website?: string;
  active?: boolean;
  minQuantity: number;
  minQuantityUnit: keyof typeof minOrdenUnits;
  paymentMethods: paymentMethodType[];
  accountNumber?: string;
  policyTerms?: string;
  logoUrl?: string;
};

export const businessTypes = [
  { value: "producer", label: "Productor" },
  { value: "distributor", label: "Distribuidor" },
  { value: "producer_distributor", label: "Productor y Distribuidor" },
  { value: "cpg", label: "Marca de Consumo (CPG)" },
];

export type LegalBusinessType = {
  legalRepresentative?: string;
  idData?: File;
  legalBusinessName?: string;
  actConstData?: File;
  csfData?: File;
  fiscalRegime?: string;
  zipCode?: string;
  satRfc?: string;
};

export type BusinessAccountType = BusinessType & LegalBusinessType;

// ------------------------------
// Alima Account
// ------------------------------

export type AlimaAccountType = {
  id: string;
  accountName: string;
  activeCedis: number;
  customerType: string;
  createdAt: Date;
};

export type AlimaChargeType = {
  id: string;
  chargeType: string;
  chargeAmount: number;
  chargeAmountType: string;
  currency: string;
  createdAt: Date;
  chargeDescription: string;
  active: boolean;
};

export type AlimaInvoiceChargeType = AlimaChargeType & {
  chargeId?: string;
  billingInvoiceId?: string;
  chargeBaseQuantity: number;
  totalCharge: number;
};

export type DisplayAlimaInvoiceType = {
  invoiceId: string;
  invoiceName: string;
  emissionDate: Date;
  payedStatus: boolean;
  totalAmount: number;
  invCharges: AlimaInvoiceChargeType[];
  invoiceFiles?: File[];
  invoiceStatus?: string;
};

export type TransferAccountType = {
  id: string;
  accountName?: string;
  bankName: string;
  accountNumber: string; // 18 digits CLABE
};

export type StripeCardType = {
  id: string;
  nameInCard: string;
  cardBrand: string;
  cardLast4: string;
  isDefault?: boolean;
};

export type AlimaPaymentMethodsType = {
  id: string;
  paymentType: string;
  paymentProvider: string;
  paymentProviderId: string;
  createdAt: Date;
  transferAccount?: TransferAccountType;
  stripeCards?: StripeCardType[];
};

export type AlimaDiscountChargeType = {
  id: string;
  chargeId: string;
  chargeDiscountAmount: number;
  chargeDiscountAmountType: string;
  chargeDiscountDescription: string;
  validUpto: Date;
};

export type SupplierAlimaAccountType = {
  supplierBusinessId: string;
  activeCedis: number;
  displayedInMarketplace: boolean;
  account?: AlimaAccountType;
  charges: AlimaChargeType[];
  paymentMethods: AlimaPaymentMethodsType[];
  discounts?: AlimaDiscountChargeType[];
};

export type SaasPluginParamType = {
  param_name: string;
  param_key: string;
  param_type: "date" | "string" | "number" | "string[]" | "number[]";
  default_value?: string;
  options?: { key: string | number; label: string }[];
};

export type SaasPluginType = {
  plugin_id: string;
  plugin_name: string;
  plugin_provider: string;
  plugin_provider_ref: string;
  plugin_params?: SaasPluginParamType[];
};

export type SaasSubsectionType = {
  subsection_id: string;
  subsection_name: string;
  available: boolean;
  plugins?: SaasPluginType[];
};

export type SaasSectionType = {
  section_id: string;
  section_name: string;
  subsections: SaasSubsectionType[];
};

export type SupplierAlimaAccountSaasConfigType = {
  supplierBusinessId: string;
  paidAccountId?: string;
  config?: {
    sections?: SaasSectionType[];
  };
  createdAt?: Date;
  lastUpdated?: Date;
};
