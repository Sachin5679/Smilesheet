import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/api";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { getReportDownloadUrl } from "../api/api";

export default function SubmissionView({ admin = false }) {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [annotationJson, setAnnotationJson] = useState([]);
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
    `http://localhost:3003/proxy-image?key=${encodeURIComponent(getS3KeyFromUrl(submission.originalImageUrl))}` :
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
      setAnnotationJson([...annotationJson, { type: "line", points: currentLine }]);
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submission Details</h1>
      <p><b>Patient Name:</b> {submission.patient?.name}</p>
      <p><b>Patient ID:</b> {submission.patientId}</p>
      <p><b>Email:</b> {submission.email}</p>
      <p><b>Status:</b> {submission.status}</p>
      <p><b>Note:</b> {submission.note}</p>

      <div className="my-4">
        <h2 className="font-bold mb-2">Original Image</h2>
        <img src={submission.originalImageUrl} alt="Original" className="max-w-full border rounded" />
      </div>

      {admin && (
        <div className="my-4">
          <h2 className="font-bold mb-2">Annotate Image</h2>
          <div className="border w-full inline-block">
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
                  ann.type === "line" && <Line key={i} points={ann.points.flatMap(p => [p.x, p.y])} stroke="red" strokeWidth={2} tension={0.5} lineCap="round" />
                ))}
                {currentLine.length > 0 && (
                  <Line points={currentLine.flatMap(p => [p.x, p.y])} stroke="red" strokeWidth={2} tension={0.5} lineCap="round" />
                )}
              </Layer>
            </Stage>
          </div>
          <button onClick={handleSaveAnnotation} className="bg-blue-500 text-white px-3 py-1 rounded mt-2">Save Annotation</button>
          <button onClick={handleGenerateReport} className="bg-green-500 text-white px-3 py-1 rounded mt-2 ml-2">Generate PDF</button>
        </div>
      )}

      {submission.annotatedImageUrl && (
        <div className="my-4">
          <h2 className="font-bold">Annotated Image</h2>
          <img src={submission.annotatedImageUrl} alt="Annotated" className="max-w-full border rounded" />
        </div>
      )}

      {submission.reportUrl && !admin && (
        <button onClick={handleDownloadReport} className="bg-purple-500 text-white px-3 py-1 rounded mt-2">
          Download Report
        </button>
      )}
    </div>
  );
}