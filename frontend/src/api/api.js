import axios from "axios";

const instance = axios.create({
  baseURL: "https://oral-vis-task.vercel.app/", 
  withCredentials: true, 
});

// Fetch pre-signed download URL for a report
export const getReportDownloadUrl = async (submissionId) => {
  const res = await instance.get(`/patient/submissions/${submissionId}/report`);
  return res.data.downloadUrl; 
};

export default instance;
