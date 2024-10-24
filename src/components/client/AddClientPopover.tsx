// material
// hooks
import { useNavigate } from "react-router";
// routes
import { PATH_APP } from "../../routes/paths";
// components
// styles
import track from "../../utils/analytics";
import FixedAddButton from "../footers/FixedAddButton";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const AddClientPopover: React.FC = () => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(PATH_APP.client.add.form);
    track("select_content", {
      visit: window.location.toString(),
      section: "AddClientPopover",
      page: "ListClients",
    });
  };

  return (
    <>
      <FixedAddButton
        onClick={handleOpen}
        buttonSize={"medium"}
        buttonMsg={"Agregar Cliente"}
        sx={{
          bottom: { xs: 70, lg: 48 },
          left: { xs: "25%", md: "42%" },
          zIndex: 1000,
        }}
      />
    </>
  );
};

export default AddClientPopover;
