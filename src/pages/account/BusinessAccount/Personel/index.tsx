// material
// components
import AddPersonel from "./AddPersonel";
import EditPersonel from "./EditPersonel";

// --------------------


type PersonelProps = {
  viewMode: 'add' | 'edit';
};

const Personel: React.FC<PersonelProps> = ({ viewMode }) => {
  if (viewMode === 'add') {
    return <AddPersonel />;
  } else  {
    return <EditPersonel />;
  }
};

export default Personel;
