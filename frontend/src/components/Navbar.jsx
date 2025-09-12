import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg px-8 py-4 flex justify-between items-center border-b border-gray-200">
      <Link to="/" className="font-extrabold text-2xl tracking-tight text-blue-700 hover:text-blue-900 transition-colors">TeethApp</Link>

      {user ? (
        <div className="flex items-center gap-6">
          <span className="text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full shadow-sm">{user.name} <span className="text-xs text-gray-500 font-normal">({user.role})</span></span>

          {user.role === "admin" && (
            <Link to="/admin/submissions" className="text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition-colors">Dashboard</Link>
          )}
          {user.role === "patient" && (
            <Link to="/patient/submissions" className="text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition-colors">My Submissions</Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-1.5 rounded-lg text-white font-semibold shadow hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-700 font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors">Login</Link>
          <Link to="/register" className="text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition-colors">Register</Link>
        </div>
      )}
    </nav>
  );
}
