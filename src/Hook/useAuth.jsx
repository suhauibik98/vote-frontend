// hooks/useAuth.js
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const useAuth = () => {
  const { token, isAuthenticated, authInitialized } = useSelector((state) => state.auth);
  let decoded = {};

  try {
    const cookieToken = token || Cookies.get("authToken");
    decoded = cookieToken ? jwtDecode(cookieToken) : {};
        
  } catch (err) {
    console.error("Invalid token:", err);
  }

  return {
    isAuthenticated,
    isAdmin: decoded?.isAdmin,
    user: decoded,
    authInitialized,
  };
};
