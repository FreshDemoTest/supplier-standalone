// material
// components
import AddProductsByFile from "./AddProductsByFile";
import AddSupplierProduct from "./AddSupplierProduct";
import EditSupplierProduct from "./EditSupplierProduct";

// --------------------
type SupplierProductViewProps = {
  viewMode: "add" | "edit" | "upload";
};

const SupplierProduct: React.FC<SupplierProductViewProps> = ({ viewMode }) => {
  if (viewMode === "upload") {
    return <AddProductsByFile />;
  } else if (viewMode === "add") {
    return <AddSupplierProduct />;
  } else {
    return <EditSupplierProduct />;
  }
};

export default SupplierProduct;
