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
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Upload Teeth Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Patient Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
        <button className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600">
          Submit
        </button>
      </form>
    </div>
  );
}
