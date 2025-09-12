const express = require("express");
const PDFDocument = require("pdfkit");
const { protect, authorize } = require("../middlewares/authMiddleware");
const Submission = require("../models/Submission");
const s3 = require("../config/s3");
const axios = require("axios");

const router = express.Router();

router.post("/submissions/:id/report", protect, authorize("admin"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("patient", "name email");
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    let originalImgBuffer = null;
    let annotatedImgBuffer = null;

    if (submission.originalImageUrl) {
      const key = decodeURIComponent(new URL(submission.originalImageUrl).pathname.substring(1));
      const s3Object = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();
      originalImgBuffer = s3Object.Body;
    }

    if (submission.annotatedImageUrl) {
      const key = decodeURIComponent(new URL(submission.annotatedImageUrl).pathname.substring(1));
      const s3Object = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();
      annotatedImgBuffer = s3Object.Body;
    }

    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const pdfEndPromise = new Promise((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);
    });

    doc.fontSize(20).text("Patient Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Patient Name: ${submission.patient.name}`);
    doc.text(`Patient ID: ${submission.patientId}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Note: ${submission.note}`);
    doc.text(`Uploaded: ${submission.createdAt.toLocaleString()}`);
    doc.moveDown();

    if (originalImgBuffer) {
      doc.text("Original Image:");
      doc.image(originalImgBuffer, { fit: [400, 300], align: "center" });
      doc.moveDown();
    } else doc.text("Original image not available.");

    if (annotatedImgBuffer) {
      doc.text("Annotated Image:");
      doc.image(annotatedImgBuffer, { fit: [400, 300], align: "center" });
      doc.moveDown();
    } else doc.text("Annotated image not available.");

    doc.end();
    await pdfEndPromise;

    const pdfBuffer = Buffer.concat(buffers);

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `reports/${Date.now()}-${submission.patientId}.pdf`,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    const s3Data = await s3.upload(s3Params).promise();

    submission.reportUrl = s3Data.Location;
    submission.status = "reported";
    submission.updatedAt = Date.now();
    await submission.save();

    res.json({ message: "Report generated successfully", reportUrl: s3Data.Location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

module.exports = router;