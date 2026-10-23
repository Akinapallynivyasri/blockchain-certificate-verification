import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to={user ? "/dashboard" : "/verify"}>
        🔗 Certificate Verification
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2">
        <Link className="btn btn-outline-light btn-sm" to="/verify">
          Verify
        </Link>

        {user ? (
          <>
            <Link className="btn btn-outline-light btn-sm" to="/issue">
              Issue
            </Link>
            <span className="text-white-50 small d-none d-md-inline">{user.organization}</span>
            <button className="btn btn-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline-light btn-sm" to="/login">
              Login
            </Link>
            <Link className="btn btn-light btn-sm" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
