export type SupplierProductTag = {
  id?: string;
  tagKey: string;
  tagValue: string;
};

export type SupplierProductImage = {
  id: string;
  imageUrl: string;
  priority: number;
  createdAt: Date;
  lastUpdated: Date;
};

export type SupplierProductStock = {
  id: string;
  amount: string;
  suppplierUnitId?: number;
  unit?: string;
};

export type SupplierProductType = {
  id?: string;
  productUuid?: string;
  sku: string;
  upc?: string;
  productCategory?: string;
  productDescription: string;
  sellUnit: string;
  buyUnit?: string;
  conversionFactor?: number;
  minimumQuantity?: number;
  unitMultiple?: number;
  estimatedWeight?: number;
  longDescription?: string;
  stock?: { uuid: string; amount: number; unit: string; keepSellingWithoutStock: boolean; active:boolean; createdAt: string, availability?: number };
  price?: { uuid: string; amount: number; unit: string; validUntil: string };
  taxAmount?: number; // percentage of the total price
  iepsAmount?: number,
  taxId?: string; // SAT tax id
  taxUnit?: string; // SAT tax unit
  tags?: SupplierProductTag[];
  images?: SupplierProductImage[];
};

export const UOMTypes = {
  kg: "Kg",
  unit: "Pieza",
  // dome: 'Domo',
  liter: "Litro",
  pack: "Paquete",
  dozen: "Docena",
};

export type UOMType = keyof typeof UOMTypes;

export const IntegerUOMTypes = [
  "unit",
  // 'dome',
  "pack",
  "dozen",
];

export const BuyUOMMap = {
  kg: ["kg" as UOMType],
  liter: ["liter" as UOMType],
  unit: ["unit" as UOMType, "kg" as UOMType, "liter" as UOMType],
  dozen: ["dozen" as UOMType, "unit" as UOMType],
  pack: [
    "pack" as UOMType,
    "unit" as UOMType,
    "kg" as UOMType,
    "liter" as UOMType,
  ],
};

export const DeliveryTypes = {
  pickup: "Recoger en Almacén",
  delivery: "Entrega",
};

export type DeliveryType = keyof typeof DeliveryTypes;

export const decodeDeliveryTypes = (value: string) => {
  const _dec = Object.entries(DeliveryTypes)
    .map(([key, val]) => [val, key])
    .find(([key, val]) => val === value);
  return _dec ? _dec[0] : undefined;
};

export type MxSatProductCodeType = {
  satCode: string;
  satCodeFamily: string;
  satDescription: string;
};
