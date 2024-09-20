import { ClientBranchType } from '../client/Client';
import { SupplierProductImage, SupplierProductType, UOMType } from './SupplierProduct';

export type SupplierPriceType = {
  id?: string;
  supplierProductId: string;
  price: number;
  currency: string;
};

export type PriceListDetailsType = {
  id?: string;
  sku: string;
  sellUnit: UOMType;
  description: string;
  price: SupplierPriceType;
  images?: SupplierProductImage[];
};

export type SupplierPriceListType = {
  id: string;
  listName: string;
  validUpto: Date;
  pricesDetails: PriceListDetailsType[];
  isDefault: boolean;
  clients: ClientBranchType[];
  lastUpdated?: Date;
  supplierUnitId?: string;
};

export type SupplierStockListType = {
  stock: SupplierProductType[];
};

export type SupplierStockDetailsType = {
  uuid: string;
  amount: number;
  unit: string;
  keepSellingWithoutStock:boolean;
  active:boolean;
  createdAt: string,
  availability?: number
};

export type SupplierPriceListFormType = {
  listName?: string;
  isDefault?: boolean;
  resBranches?: string[];
  supUnitIds?: string[];
  validUntil?: Date;
}

export type SupplierPriceListUploadStateType = SupplierPriceListFormType & {
  xlsxPriceListData?: File;
};

export type SupplierPriceListStateType = SupplierPriceListFormType & {
  pricesDetails: PriceListDetailsType[];
};
