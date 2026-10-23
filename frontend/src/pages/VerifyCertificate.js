import { useState } from "react";
import Navbar from "../components/Navbar";
import api, { errorMessage } from "../api";

function VerifyCertificate() {
  const [mode, setMode] = useState("file"); // "file" or "hash"
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const body = new FormData();
    if (mode === "file") {
      if (!file) return setError("Please choose a certificate file to check.");
      body.append("file", file);
    } else {
      if (!hash.trim()) return setError("Please paste the certificate hash.");
      body.append("hash", hash.trim());
    }

    setLoading(true);
    try {
      const { data } = await api.post("/certificates/verify", body);
      setResult(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 640 }}>
        <h3>Verify Certificate</h3>
        <p className="text-muted">No account needed. Upload the certificate or paste its hash.</p>

        <ul className="nav nav-pills mb-3">
          <li className="nav-item">
            <button className={`nav-link ${mode === "file" ? "active" : ""}`} onClick={() => switchMode("file")}>
              Upload file
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${mode === "hash" ? "active" : ""}`} onClick={() => switchMode("hash")}>
              Enter hash
            </button>
          </li>
        </ul>

        <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          {mode === "file" ? (
            <input className="form-control mb-3" type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0] || null)} />
          ) : (
            <input className="form-control mb-3 hash-box" placeholder="64-character SHA-256 hash"
              value={hash} onChange={(e) => setHash(e.target.value)} />
          )}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Checking..." : "Verify"}
          </button>
        </form>

        {result && (
          <div className={`card p-4 mt-4 shadow-sm ${result.valid ? "border-success" : "border-danger"}`}>
            {result.valid ? (
              <>
                <h4 className="text-success">✔ Valid certificate</h4>
                <dl className="row mb-0">
                  <dt className="col-sm-4">Student</dt>
                  <dd className="col-sm-8">{result.certificate.studentName} ({result.certificate.studentId})</dd>
                  <dt className="col-sm-4">Course</dt>
                  <dd className="col-sm-8">{result.certificate.course}</dd>
                  <dt className="col-sm-4">Issued by</dt>
                  <dd className="col-sm-8">{result.certificate.issuedBy}</dd>
                  <dt className="col-sm-4">Issued on</dt>
                  <dd className="col-sm-8">{new Date(result.certificate.issuedAt).toLocaleDateString()}</dd>
                </dl>
              </>
            ) : (
              <>
                <h4 className="text-danger">✖ Fake or altered certificate</h4>
                <p className="mb-0">{result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default VerifyCertificate;
