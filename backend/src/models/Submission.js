const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: String, required: true },
  email: { type: String, required: true },
  note: { type: String },
  imageUrl: { type: String, required: true },
  annotatedImageUrl: { type: String },
  annotationJson: { type: Object },
  reportUrl: { type: String },
  status: { type: String, enum: ["uploaded", "annotated", "reported"], default: "uploaded" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model("Submission", submissionSchema);
