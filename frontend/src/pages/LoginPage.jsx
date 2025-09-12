import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-gray-100">
        <h2 className="text-2xl font-extrabold mb-4 text-blue-700 text-center tracking-tight">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"/>
        <button className="bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors mt-2">Login</button>
      </form>
    </div>
  );
}
