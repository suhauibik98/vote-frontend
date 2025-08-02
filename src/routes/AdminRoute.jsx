// routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Hook/useAuth";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, authInitialized } = useAuth();

  if (!authInitialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
