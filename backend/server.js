const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

const app = express();


// CONNECT DATABASE


connectDB();


// MIDDLEWARE


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://factory-flow-git-main-teamanoop.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// STATIC UPLOADS


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// HEALTH CHECK


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FactoryFlow API is running",
  });
});


// ROUTES


// Authentication
app.use("/api/auth", require("./routes/authRoutes"));

// Inward Supply
app.use("/api/inward", require("./routes/inwardRoutes"));

// Production
app.use("/api/production", require("./routes/productionRoutes"));

// Quality Inspection
app.use("/api/quality", require("./routes/qualityInspectionRoutes"));

// Dispatch
app.use("/api/dispatch", require("./routes/dispatchRoutes"));


// SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FactoryFlow server running on port ${PORT}`);
});
