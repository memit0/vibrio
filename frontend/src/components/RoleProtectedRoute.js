import { Navigate } from 'react-router-dom';
import { canCreateCampaign } from '../utils/roleCheck';

function RoleProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // We'll store this during login

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!canCreateCampaign(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default RoleProtectedRoute; 