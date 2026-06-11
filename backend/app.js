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

const {
  requestLoggingMiddleware,
} = require(
  "./middleware/loggingMiddleware"
);

const app = express();

// Enhanced security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny",
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);

// CORS configuration - restrict to specific origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request body size limits
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(morgan("dev"));

// Structured logging middleware
app.use(requestLoggingMiddleware);

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
