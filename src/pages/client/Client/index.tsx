import { Navigate } from 'react-router';
// routes
import { PATH_APP } from '../../../routes/paths';
// components
import AddSupplier from './AddClient';
import EditClient from './EditClient';

// ----------------------------------------------------------------------

type ClientViewProps = {
  viewMode: 'add' | 'edit';
};

const Client: React.FC<ClientViewProps> = ({ viewMode }) => {
  if (viewMode === 'add') {
    return <AddSupplier />;
  } else if (viewMode === 'edit') {
    return <EditClient />;
  } else {
    return <Navigate to={PATH_APP.root} replace />;
  }
};

export default Client;
