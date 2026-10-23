import { useState } from "react";
import Navbar from "../components/Navbar";
import api, { errorMessage } from "../api";

const emptyForm = { studentId: "", studentName: "", course: "" };

function IssueCertificate() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIssued(null);

    if (!file) {
      setError("Please choose the certificate file first.");
      return;
    }

    // The raw file goes to the server, which hashes the exact bytes.
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append("file", file);

    setLoading(true);
    try {
      const { data } = await api.post("/certificates/issue", body);
      setIssued(data.certificate);
      setForm(emptyForm);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(issued.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically - please select the hash and copy it by hand.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 640 }}>
        <h3>Issue Certificate</h3>

        <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <input className="form-control mb-3" name="studentId" placeholder="Student ID"
            value={form.studentId} onChange={handleChange} required />
          <input className="form-control mb-3" name="studentName" placeholder="Student name"
            value={form.studentName} onChange={handleChange} required />
          <input className="form-control mb-3" name="course" placeholder="Course / degree"
            value={form.course} onChange={handleChange} required />

          <label className="form-label small text-muted">Certificate file (PDF, PNG or JPG, up to 5 MB)</label>
          <input className="form-control mb-3" type="file" accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0] || null)} />

          <button className="btn btn-success" disabled={loading}>
            {loading ? "Issuing..." : "Issue & Generate Hash"}
          </button>
        </form>

        {issued && (
          <div className="card p-4 mt-4 border-success shadow-sm">
            <h5 className="text-success">Certificate issued for {issued.studentName}</h5>
            <p className="small text-muted mb-1">SHA-256 hash (share this or the original file for verification):</p>
            <div className="hash-box bg-light p-2 rounded border">{issued.hash}</div>
            <button className="btn btn-outline-secondary btn-sm mt-2 align-self-start" onClick={copyHash}>
              {copied ? "Copied!" : "Copy hash"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default IssueCertificate;
