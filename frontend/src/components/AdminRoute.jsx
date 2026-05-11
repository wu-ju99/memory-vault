import { Navigate } from 'react-router-dom';
import { getUser, isAuthenticated } from '../utils/auth';

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
