import { Navigate } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// routes
import { PATH_APP } from '../routes/paths';

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: any;
};

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={PATH_APP.root} />;
  }

  return <>{children}</>;
};

export default GuestGuard;
