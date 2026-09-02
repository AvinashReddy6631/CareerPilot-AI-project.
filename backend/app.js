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
const paymentRoutes = require("./routes/paymentRoutes");
const interviewHistoryRoutes = require(
  "./routes/interviewHistoryRoutes"
);
const roadmapRoutes = require(
  "./routes/roadmapRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);
const paymentWebhookRoutes = require(
  "./routes/paymentWebhookRoutes"
);
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");




const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");
const app = express();
app.set("trust proxy", 1);

app.use(helmet());
const { apiLimiter } = require("./middleware/rateLimit");
app.use(apiLimiter);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
  })
);



app.use(
  "/api/payment/webhook",
  paymentWebhookRoutes
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
app.use("/api/payment", paymentRoutes);

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