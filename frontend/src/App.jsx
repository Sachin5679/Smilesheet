import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubmissionView from "./pages/SubmissionView";
import SubmissionUpload from "./pages/SubmissionUpload";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useAuthStore();

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {user?.role === "patient" && (
        <>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/submissions/upload" element={<SubmissionUpload />} />
          <Route path="/patient/submissions/:id" element={<SubmissionView />} />
        </>
      )}

      {user?.role === "admin" && (
        <>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/submissions/:id" element={<SubmissionView admin />} />
        </>
      )}

      <Route
        path="*"
        element={<Navigate to={user ? (user.role==="admin"?"/admin/dashboard":"/patient/dashboard") : "/login"} />}
      />
    </Routes>
    </>

  );
}

export default App;
