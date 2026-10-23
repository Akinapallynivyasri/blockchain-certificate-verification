import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="text-center mt-5">Institution Login</h2>

      <form className="card p-4 mt-4 shadow-sm" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <input className="form-control mb-3" name="email" type="email" placeholder="Email"
          value={form.email} onChange={handleChange} required />
        <input className="form-control mb-3" name="password" type="password" placeholder="Password"
          value={form.password} onChange={handleChange} required />

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center mt-3">
        New here? <Link to="/register">Create an account</Link> · <Link to="/verify">Verify a certificate</Link>
      </p>
    </div>
  );
}

export default Login;
