/*
|--------------------------------------------------------------------------
| NOT FOUND MIDDLEWARE
|--------------------------------------------------------------------------
|
| Handles routes that don't exist.
|
*/

const notFound = (req, res, next) => {
  const error = new Error(
    `Not Found - ${req.originalUrl}`
  );

  res.status(404);

  next(error);
};

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| Handles all server errors.
|
*/

const errorHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  let message = err.message;

  res.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV ===
      "production"
        ? null
        : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};