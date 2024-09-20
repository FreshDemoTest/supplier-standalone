import { UnitPOCType, UnitType } from "../account/SUnit";
import { UserType } from "../account/User";
import { ClientBranchType, ClientPOCType } from "../client/Client";
import { DeliveryType, SupplierProductType } from "../supplier/SupplierProduct";

export type CartProductType = {
  id?: string;
  supplierProduct: SupplierProductType;
  quantity: number;
  price?: { uuid: string; amount: number; unit: string; validUntil: string };
  total?: number;
  comments?: string;
};

export type CartType = {
  id?: string;
  cartProducts: CartProductType[];
};

export const ordenStatusTypes = {
  submitted: "Enviado",
  accepted: "Confirmado",
  picking: "En proceso",
  shipping: "En camino",
  delivered: "Entregado",
  canceled: "Cancelado",
};

export type ordenStatusType = keyof typeof ordenStatusTypes;

export const decodeOrdenStatusTypes = (value: string) => {
  const _dec = Object.entries(ordenStatusTypes)
    .map(([key, val]) => [val, key])
    .find(([key, val]) => val === value);
  return _dec ? _dec[0] : undefined;
};

export const paymentMethods = {
  transfer: "Transferencia",
  cash: "Efectivo",
  money_order: "Cheque",
  // card: 'Tarjeta'
  TBD: "Por Definir",
};

export type paymentMethodType = keyof typeof paymentMethods;

export type OrdenType = {
  id?: string;
  ordenNumber?: string;
  version?: string;
  ordenType: string;
  status: ordenStatusType;
  restaurantBranch: ClientBranchType & ClientPOCType & { fullAddress?: string };
  supplier: UnitType & UnitPOCType & { fullAddress?: string };
  cart: CartType;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryType?: DeliveryType;
  subtotalWithoutTax?: number;
  tax?: number;
  subtotal: number;
  discount?: { amount: number; code: string };
  cashback?: { uuid: string; amount: number; code: string };
  shippingCost?: number;
  packagingCost?: number;
  serviceFee?: number;
  total?: number;
  comments?: string;
  paymentMethod?: string;
  paystatus?: paymentStatusType;
  createdBy?: UserType;
  createdAt: string;
  lastUpdated: string;
};

export type InvoiceType = {
  id?: string;
  uuid?: string;
  folio?: string;
  client?: ClientBranchType & ClientPOCType;
  supplier?: UnitType & UnitPOCType & { fullAddress?: string };
  paymentMethod?: paymentMethodType;
  total?: number;
  pdfFile?: File;
  xmlFile?: File;
  status?: string;
  associatedOrdenId?: string;
  createdAt?: Date;
  cancelResult?: string
  invoiceType?: string
};

export enum InvoiceStatusTypes {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
}

export const decodeInvoiceStatusTypes = (value: string) => {
  if (value.toUpperCase() === InvoiceStatusTypes.ACTIVE) {
    return "Activa";
  } else if (value.toUpperCase() === InvoiceStatusTypes.CANCELED) {
    return "Cancelada";
  } else {
    return "N/A";
  }
};

export const paymentStatusTypes = {
  paid: "Pagado",
  unpaid: "Sin Pagar",
  partially_paid: "Pago Parcial",
  unknown: "Sin Definir",
};

export type paymentStatusType = keyof typeof paymentStatusTypes;

export const decodeOrdenPayStatusTypes = (value: string) => {
  const _dec = Object.entries(paymentStatusTypes)
    .map(([key, val]) => [val, key])
    .find(([key, val]) => val === value);
  return _dec ? _dec[0] : undefined;
};

export type PayStatusType = {
  id?: string;
  ordenId?: string;
  status?: paymentStatusType;
  createdAt?: Date;
  createdBy?: UserType;
};

export type PaymentReceiptOrdenType = {
  id?: string;
  deleted?: boolean;
  ordenId?: string;
  paymentReceiptId?: string;
  createdAt?: Date;
  createdBy?: string;
  complement?: ComplementPaymentType;
};

export type PaymentReceiptType = {
  id?: string;
  paymentValue?: number;
  evidenceFile?: File;
  comments?: string;
  createdAt?: Date;
  createdBy?: string;
  lastUpdated?: Date;
  paymentDay?: Date;
  ordenes?: PaymentReceiptOrdenType[];
};

export type ComplementPaymentType = {
  id?: string;
  satInvoiceUuid?: string;
  pdfFile?: File;
  xmlFile?: File;
  total?: number;
};

export enum ExecutionStatusTypes {
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export type InvoiceExecutionStatusType = {
  id?: string;
  ordenDetailsId?: string;
  executionStart?: Date;
  executionEnd?: Date;
  result: string;
  status: string; // ExecutionStatusTypes;
};

export type ProductValidationType = CartProductType & {
  supplier: any; // SupplierType & SupplierPOCType;
} & {
  createdBy: UserType;
};

export type SupplierProductsBundleType = {
  supplier: any; // SupplierType & SupplierPOCType;
  supplierProducts: CartProductType[];
  createdBy: UserType[];
};

// from 9 to 18 hrs
const timeOptions = [...Array(10)].map((_, i) => {
  return i + 9;
});

export const deliveryTimeWindowOptions = [
  { label: "Entre (9 - 18hrs)", value: "9 - 18" },
].concat(
  timeOptions.map((time) => {
    return {
      label: `Entre (${time} - ${time + 1}hrs)`,
      value: `${time} - ${time + 1}`,
    };
  })
);
