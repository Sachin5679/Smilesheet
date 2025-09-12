import { useState } from "react";
import axios from "../api/api";

export default function PatientSubmissionForm() {
  const [name, setName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("patientId", patientId);
    formData.append("email", email);
    formData.append("note", note);
    formData.append("image", image);

    try {
      await axios.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Submission uploaded!");
    } catch (err) {
        console.log(err);
        
      alert("Failed to upload");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 mt-10 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight">Upload Teeth Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="text"
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="email"
          placeholder="Patient Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <textarea
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full border border-gray-200 rounded-lg bg-gray-50 p-2"
        />
        <button className="bg-green-600 text-white w-full py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors mt-2">
          Submit
        </button>
      </form>
    </div>
  );
}
