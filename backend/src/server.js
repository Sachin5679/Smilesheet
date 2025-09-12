const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser"); 

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser()); 

const cors = require("cors");

const corsOptions = {
  origin: "https://oral-vis-task-frontend.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));



const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/test", testRoutes);

const submissionRoutes = require("./routes/submissionRoutes");
app.use("/submissions", submissionRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/admin", reportRoutes);


const patientRoutes = require("./routes/patientRoutes");
app.use("/patient", patientRoutes);

const s3 = require('./config/s3');

app.get('/proxy-image', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ message: 'Missing key param' });
  try {
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };
    const s3Object = await s3.getObject(s3Params).promise();
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', s3Object.ContentType || 'application/octet-stream');
    res.send(s3Object.Body);
  } catch (err) {
    console.error('[Proxy S3 Image Error]', err);
    res.status(404).json({ message: 'Image not found' });
  }
});


app.get("/", (req, res) => res.send("Running...."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
