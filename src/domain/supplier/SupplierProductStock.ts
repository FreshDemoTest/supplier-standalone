export type SupplierProductStockFormType = {
  supUnitIds?: string[];
}

export type SupplierProductStockUploadStateType = SupplierProductStockFormType & {
  xlsxProductStockListData?: File;
};

