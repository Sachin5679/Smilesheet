import { useEffect, useState } from "react";
import axios from "../api/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("/admin/submissions").then(res => setSubmissions(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Submissions</h1>
      <div className="space-y-3">
        {submissions.map(s => (
          <div key={s._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p><b>Patient:</b> {s.patient?.name}</p>
              <p><b>Status:</b> {s.status}</p>
              <p><b>Note:</b> {s.note}</p>
            </div>
            <Link to={`/admin/submissions/${s._id}`} className="bg-blue-500 text-white px-3 py-1 rounded">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
