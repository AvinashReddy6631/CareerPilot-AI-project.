// GIT TEST 123
require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");

/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| Port
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

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