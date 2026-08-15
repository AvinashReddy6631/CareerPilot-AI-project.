// GIT TEST 123
require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");

/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
==================================================
🚀 CareerPilot AI Server Started
==================================================
🌐 Environment : ${process.env.NODE_ENV}
📡 Port        : ${PORT}
==================================================
`);
  });
};

startServer();

/*
|--------------------------------------------------------------------------
| Handle Unexpected Errors
|--------------------------------------------------------------------------
*/

process.on(
  "unhandledRejection",
  (err) => {
    console.error(
      "Unhandled Rejection:",
      err.message
    );

    process.exit(1);
  }
);

process.on(
  "uncaughtException",
  (err) => {
    console.error(
      "Uncaught Exception:",
      err.message
    );

    process.exit(1);
  }
);
