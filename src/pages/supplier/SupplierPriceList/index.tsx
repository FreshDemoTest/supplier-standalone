// material
// components
import AddPriceList from "./AddPriceList";
import AddPriceListByFile from "./AddPriceListByFile";
import EditPriceList from "./EditPriceList";
import EditPriceListByFile from "./EditPriceListByFile";
import PriceListDetails from "./PriceListDetails";

// --------------------
type SupplierPriceListViewProps = {
  viewMode: "add" | "edit" | "upload" | "editUpload" | "details";
};

const SupplierPriceList: React.FC<SupplierPriceListViewProps> = ({
  viewMode,
}) => {
  if (viewMode === "upload") {
    return <AddPriceListByFile />;
  } else if (viewMode === "editUpload") {
    return <EditPriceListByFile />;
  } else if (viewMode === "add") {
    return <AddPriceList />;
  } else if (viewMode === "edit") {
    return <EditPriceList />;
  } else {
    return <PriceListDetails />;
  }
};

export default SupplierPriceList;
