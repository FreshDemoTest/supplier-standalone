// material
// components
import AddStockByFile from "./AddStockByFile";
import AddStock from "./AddStock";

// --------------------
type SupplierProductStockViewProps = {
    viewMode: "add" | "upload";
};

const SupplierProductStock: React.FC<SupplierProductStockViewProps> = ({
    viewMode,
}) => {
    if (viewMode === "upload") {
        return <AddStockByFile />;
    }
    if (viewMode === "add") {
        return <AddStock />;
    }
    else {
        return <AddStockByFile />;
    }
};

export default SupplierProductStock;
