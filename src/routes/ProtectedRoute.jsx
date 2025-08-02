// routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Hook/useAuth";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useAuth();
  const location = useLocation();

  if (!authInitialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated ) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
