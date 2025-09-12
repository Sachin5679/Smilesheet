import { useState } from "react";
import axios from "../api/api";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function SubmissionUpload() {
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("note", note);
    formData.append("patientId", user._id);
    formData.append("email", user.email);

    try {
      await axios.post("/submissions/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Submission uploaded");
      navigate("/patient/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight">Upload Submission</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="border border-gray-200 rounded-lg bg-gray-50 p-2" />
        <textarea placeholder="Notes" value={note} onChange={(e) => setNote(e.target.value)} className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"/>
        <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors mt-2">Upload</button>
      </form>
    </div>
  );
}
