import { useEffect, useState } from "react";
import axios from "../api/api";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("/patient/submissions").then(res => setSubmissions(res.data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg mt-8 border border-gray-100">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-700 tracking-tight">Your Submissions</h1>
      <Link to="/patient/submissions/upload" className="bg-blue-600 text-white py-2 px-6 rounded-lg mb-6 inline-block font-semibold shadow hover:bg-blue-700 transition-colors">Upload New</Link>
      <div className="space-y-4">
        {submissions.map(s => (
          <div key={s._id} className="border border-gray-200 p-5 rounded-xl flex justify-between items-center bg-gray-50 hover:shadow transition-shadow">
            <div>
              <p className="text-sm text-gray-500"><b>Status:</b> {s.status}</p>
              <p className="text-sm text-gray-500"><b>Note:</b> {s.note}</p>
            </div>
            <Link to={`/patient/submissions/${s._id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
