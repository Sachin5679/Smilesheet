const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const Submission = require("../models/Submission");
const AWS = require("aws-sdk");

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.get("/submissions", protect, authorize("patient"), async (req, res) => {
  try {
    const submissions = await Submission.find({ patient: req.user._id })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

router.get("/submissions/:id", protect, authorize("patient"), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

router.get("/submissions/:id/report", protect, authorize("patient"), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (!submission.reportUrl) return res.status(404).json({ message: "Report not yet generated" });

    const url = new URL(submission.reportUrl);
    const key = decodeURIComponent(url.pathname.substring(1)); // remove leading '/'

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    res.setHeader("Content-Disposition", `attachment; filename=report-${submission.patientId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    const fileStream = s3.getObject(s3Params).createReadStream();
    fileStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to download report" });
  }
});

module.exports = router;
