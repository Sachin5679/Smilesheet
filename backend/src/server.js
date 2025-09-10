const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser"); 

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser()); 


const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/test", testRoutes);

const submissionRoutes = require("./routes/submissionRoutes");
app.use("/submissions", submissionRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);


app.get("/", (req, res) => res.send("Running...."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
