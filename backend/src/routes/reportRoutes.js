const express = require("express");
const PDFDocument = require("pdfkit");
const { protect, authorize } = require("../middlewares/authMiddleware");
const Submission = require("../models/Submission");
const s3 = require("../config/s3");

const router = express.Router();


router.post(
  "/submissions/:id/report",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id).populate("patient", "name email");
      if (!submission) return res.status(404).json({ message: "Submission not found" });

      const doc = new PDFDocument();
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
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

        res.json({
          message: "Report generated successfully",
          reportUrl: s3Data.Location,
        });
      });

      doc.fontSize(20).text("Patient Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Patient Name: ${submission.patient.name}`);
      doc.text(`Patient ID: ${submission.patientId}`);
      doc.text(`Email: ${submission.email}`);
      doc.text(`Note: ${submission.note}`);
      doc.text(`Uploaded: ${submission.createdAt.toLocaleString()}`);
      doc.moveDown();

      if (submission.imageUrl) {
        try {
          doc.text("Original Image:");
          doc.image(submission.imageUrl, { fit: [400, 300], align: "center" });
          doc.moveDown();
        } catch (e) {
          doc.text("⚠️ Could not embed original image.");
        }
      }

      // Annotated image
      if (submission.annotatedImageUrl) {
        try {
          doc.text("Annotated Image:");
          doc.image(submission.annotatedImageUrl, { fit: [400, 300], align: "center" });
          doc.moveDown();
        } catch (e) {
          doc.text("⚠️ Could not embed annotated image.");
        }
      }

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate report" });
    }
  }
);

module.exports = router;
