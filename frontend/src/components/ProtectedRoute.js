import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sends visitors who aren't logged in back to the login page.
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
