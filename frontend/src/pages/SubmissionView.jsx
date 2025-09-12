import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/api";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { getReportDownloadUrl } from "../api/api";

const ANNOTATION_TYPES = [
  { type: "Caries", color: "#e11d48" },
  { type: "Stains", color: "#f59e42" },
  { type: "Scaling", color: "#2563eb" },
];

export default function SubmissionView({ admin = false }) {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [annotationJson, setAnnotationJson] = useState([]);
  const [selectedType, setSelectedType] = useState(ANNOTATION_TYPES[0].type);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const stageRef = useRef();

  useEffect(() => {
    const route = admin ? `/admin/submissions/${id}` : `/patient/submissions/${id}`;
    axios.get(route).then(res => {
      setSubmission(res.data);
      setAnnotationJson(res.data.annotationJson || []);
    });
  }, [id, admin]);


  function getS3KeyFromUrl(url) {
    if (!url) return "";
    try {
      const u = new window.URL(url);
      // Remove leading slash
      return u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
    } catch {
      return url;
    }
  }

  const proxyImageUrl = submission?.originalImageUrl ?
    `https://oral-vis-task.vercel.app/proxy-image?key=${encodeURIComponent(getS3KeyFromUrl(submission.originalImageUrl))}` :
    "";

  const [image, imageStatus] = useImage(proxyImageUrl, "anonymous");
  if (submission) {
    console.log("[DEBUG] Submission loaded:", submission);
    console.log("[DEBUG] originalImageUrl:", submission.originalImageUrl);
    console.log("[DEBUG] proxyImageUrl:", proxyImageUrl);
  }
  console.log("[DEBUG] useImage status:", imageStatus, image);

  if (!submission) return <p>Loading...</p>;

  const handleMouseDown = () => {
    console.log("[DEBUG] handleMouseDown", { admin });
    if (!admin) return;
    setIsDrawing(true);
    setCurrentLine([]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    console.log("[DEBUG] Drawing point:", point);
    setCurrentLine([...currentLine, point]);
  };

  const handleMouseUp = () => {
    console.log("[DEBUG] handleMouseUp", { isDrawing, currentLine });
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine.length > 0) {
      setAnnotationJson([
        ...annotationJson,
        {
          type: "line",
          points: currentLine,
          annotationType: selectedType,
          color: ANNOTATION_TYPES.find(t => t.type === selectedType)?.color || "#e11d48"
        }
      ]);
    }
  };

  const handleSaveAnnotation = async () => {
    console.log("[DEBUG] handleSaveAnnotation");
    if (!admin) return;

    let uri;
    try {
      uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      console.log("[DEBUG] Canvas toDataURL success");
    } catch (err) {
      console.error("[DEBUG] Canvas toDataURL error", err);
      alert("Canvas export failed: " + err.message);
      return;
    }
    let blob;
    try {
      blob = await (await fetch(uri)).blob();
      console.log("[DEBUG] Blob created from canvas");
    } catch (err) {
      console.error("[DEBUG] Blob creation failed", err);
      alert("Blob creation failed: " + err.message);
      return;
    }
    const formData = new FormData();
    formData.append("annotatedImage", blob, `annotated-${submission.patientId}.png`);
    formData.append("annotationJson", JSON.stringify(annotationJson));

    try {
      const res = await axios.put(`/admin/submissions/${id}/annotate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[DEBUG] Annotation saved response:", res.data);
      alert("Annotation saved!");
      setSubmission(res.data.submission);
    } catch (err) {
      console.error("[DEBUG] Annotation save failed", err);
      alert(err.response?.data?.message || "Failed to save annotation");
    }
  };

  const handleGenerateReport = async () => {
    console.log("[DEBUG] handleGenerateReport");
    if (!admin) return;

    try {
      const res = await axios.post(`/admin/submissions/${id}/report`);
      console.log("[DEBUG] Report generated response:", res.data);
      alert("Report generated! PDF available at: " + res.data.reportUrl);
      setSubmission(prev => ({ ...prev, reportUrl: res.data.reportUrl, status: "reported" }));
    } catch (err) {
      console.error("[DEBUG] Report generation failed", err);
      alert(err.response?.data?.message || "Failed to generate report");
    }
  };

  const handleDownloadReport = async () => {
    console.log("[DEBUG] handleDownloadReport");
    try {
      const downloadUrl = await getReportDownloadUrl(submission._id);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg mt-8 border border-gray-100">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-700 tracking-tight">Submission Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="font-semibold text-gray-700 mb-1"><b>Patient Name:</b> <span className="font-normal">{submission.patient?.name}</span></p>
          <p className="text-sm text-gray-500 mb-1"><b>Email:</b> {submission.email}</p>
          <p className="text-sm text-gray-500 mb-1"><b>Status:</b> {submission.status}</p>
          <p className="text-sm text-gray-500 mb-1"><b>Note:</b> {submission.note}</p>
        </div>
        <div className="my-2 md:my-0">
          <h2 className="font-bold mb-2 text-gray-700">Original Image</h2>
          <img src={submission.originalImageUrl} alt="Original" className="max-w-full border border-gray-200 rounded-xl shadow" />
        </div>
      </div>

      {admin && (
        <div className="my-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-bold mb-4 text-blue-700">Annotate Image</h2>
          <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
            <label className="font-semibold text-gray-700">Annotation Type:</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {ANNOTATION_TYPES.map(t => (
                <option key={t.type} value={t.type}>{t.type}</option>
              ))}
            </select>
            <span className="flex items-center">
              <span style={{ background: ANNOTATION_TYPES.find(t => t.type === selectedType)?.color, width: 20, height: 20, display: 'inline-block', borderRadius: 4, marginRight: 6 }}></span>
              <span className="text-sm text-gray-600">{selectedType}</span>
            </span>
          </div>
          <div className="border border-gray-300 rounded-xl bg-white w-full inline-block shadow">
            <Stage
              width={600}
              height={400}
              ref={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {image && (
                  <KonvaImage
                    image={image}
                    width={600}
                    height={400}
                    listening={false}
                  />
                )}
                {annotationJson.map((ann, i) => (
                  ann.type === "line" && <Line key={i} points={ann.points.flatMap(p => [p.x, p.y])} stroke={ann.color || "#e11d48"} strokeWidth={2} tension={0.5} lineCap="round" />
                ))}
                {currentLine.length > 0 && (
                  <Line points={currentLine.flatMap(p => [p.x, p.y])} stroke={ANNOTATION_TYPES.find(t => t.type === selectedType)?.color || "#e11d48"} strokeWidth={2} tension={0.5} lineCap="round" />
                )}
              </Layer>
            </Stage>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <button onClick={handleSaveAnnotation} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">Save Annotation</button>
            <button onClick={handleGenerateReport} className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors">Generate PDF</button>
          </div>
          {/* Legend/Key */}
          <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-white">
            <h3 className="font-semibold mb-2 text-gray-700">Annotation Key:</h3>
            <ul className="flex flex-wrap gap-6">
              {ANNOTATION_TYPES.map(t => (
                <li key={t.type} className="flex items-center gap-2">
                  <span style={{ background: t.color, width: 20, height: 20, display: 'inline-block', borderRadius: 4 }}></span>
                  <span className="text-gray-600">{t.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {submission.annotatedImageUrl && (
        <div className="my-8">
          <h2 className="font-bold text-blue-700 mb-2">Annotated Image</h2>
          <img src={submission.annotatedImageUrl} alt="Annotated" className="max-w-full border border-gray-200 rounded-xl shadow" />
        </div>
      )}

      {submission.reportUrl && !admin && (
        <button onClick={handleDownloadReport} className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition-colors mt-4">
          Download Report
        </button>
      )}
    </div>
  );
}