import { InvoicePaymentMethods, InvoicingTriggers } from "../account/SUnit";

export type ClientBranchTag = {
  id?: string;
  tagKey: string;
  tagValue: string;
};

export type ClientBranchType = {
  id?: string;
  branchName: string;
  clientCategory?: string;
  street?: string;
  externalNum?: string;
  internalNum?: string;
  neighborhood?: string;
  city?: string;
  estate?: string;
  country?: string;
  zipCode?: string;
  fullAddress?: string;
  deleted?: boolean;
  tags?: ClientBranchTag[];
};

export type ClientPOCType = {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
};

export type ClientInvoiceInfoType = {
  taxId?: string;
  fiscalRegime?: string;
  taxName?: string;
  taxAddress?: string;
  cfdiUse?: string;
  taxZipCode?: string;
  invoiceEmail?: string;
  invoicePaymentMethod?: keyof typeof InvoicePaymentMethods;
  invoicingTrigger?: keyof typeof InvoicingTriggers;
};

export type ClientEcommerceUserInfoType = {
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  disabled?: boolean;
};

export const NotificationTypes = {
  email: "Email",
  whatsapp: "WhatsApp (beta)",
};

export type NotificationType = keyof typeof NotificationTypes;

export const decodeNotificationTypes = (value: string) => {
  const _dec = Object.entries(NotificationTypes)
    .map(([key, val]) => [val, key])
    .find(([key, val]) => val === value);
  return _dec ? _dec[0] : undefined;
};

export type ClientType = {
  id?: string;
  clientName: string;
  country?: string;
  category?: string;
  active: boolean;
  assignedUnit?: string; // unit Id
  relationId?: string; // relation Id
};

export type ClientProfileType = ClientBranchType &
  ClientPOCType & { business?: ClientType } & {priceList?: string} & ClientInvoiceInfoType & {
    ecommerceUser?: ClientEcommerceUserInfoType;
  };
