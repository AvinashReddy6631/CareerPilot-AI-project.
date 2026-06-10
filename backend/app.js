const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const resumeBuilderRoutes = require(
  "./routes/resumeBuilderRoutes"
);
const interviewRoutes = require(
  "./routes/interviewRoutes"
);
const interviewHistoryRoutes = require(
  "./routes/interviewHistoryRoutes"
);
const roadmapRoutes = require(
  "./routes/roadmapRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");



const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());

// Secure CORS: restrict to frontend URL
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPilot API Running",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/resume-builder",
  resumeBuilderRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

app.use(
  "/api/interview-history",
  interviewHistoryRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/roadmap",
  roadmapRoutes
);

app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
