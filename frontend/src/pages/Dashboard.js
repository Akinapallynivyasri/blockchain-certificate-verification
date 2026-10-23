import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/certificates/mine")
      .then(({ data }) => setCertificates(data.certificates))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-0">Welcome, {user.name}</h3>
            <small className="text-muted">{user.organization}</small>
          </div>
          <Link className="btn btn-success" to="/issue">+ Issue Certificate</Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <p>Loading your certificates...</p>}

        {!loading && !error && certificates.length === 0 && (
          <div className="alert alert-info">You haven't issued any certificates yet.</div>
        )}

        {certificates.length > 0 && (
          <div className="table-responsive card shadow-sm">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Issued</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.studentName}<br /><small className="text-muted">{c.studentId}</small></td>
                    <td>{c.course}</td>
                    <td>{new Date(c.issuedAt).toLocaleDateString()}</td>
                    <td className="hash-box">{c.hash.slice(0, 16)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
