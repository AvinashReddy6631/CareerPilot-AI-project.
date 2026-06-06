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



const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "*",
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

app.use(notFound);

app.use(errorHandler);

module.exports = app;