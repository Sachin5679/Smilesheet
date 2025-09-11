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
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Upload Submission</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <textarea placeholder="Notes" value={note} onChange={(e) => setNote(e.target.value)} className="border p-2 rounded"/>
        <button className="bg-blue-500 text-white py-2 rounded">Upload</button>
      </form>
    </div>
  );
}
