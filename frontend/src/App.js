import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IssueCertificate from "./pages/IssueCertificate";
import VerifyCertificate from "./pages/VerifyCertificate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/verify" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyCertificate />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/issue" element={<ProtectedRoute><IssueCertificate /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/verify" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
