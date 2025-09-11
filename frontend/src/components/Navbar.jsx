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
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">TeethApp</Link>

      {user ? (
        <div className="flex items-center space-x-4">
          <span>{user.name} ({user.role})</span>

          {user.role === "admin" && (
            <Link to="/admin/submissions" className="hover:underline">Dashboard</Link>
          )}
          {user.role === "patient" && (
            <Link to="/patient/submissions" className="hover:underline">My Submissions</Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </div>
      )}
    </nav>
  );
}
