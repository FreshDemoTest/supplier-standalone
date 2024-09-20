// material
// components
import AddSUnit from './AddSUnit';
import EditSUnit from './EditSUnit';

// --------------------
type SUnitViewProps = {
  viewMode: 'add' | 'edit';
};

const SUnit: React.FC<SUnitViewProps> = ({ viewMode }) => {
  if (viewMode === 'add') {
    return <AddSUnit />;
  } else {
    return <EditSUnit />;
  }
};

export default SUnit;
