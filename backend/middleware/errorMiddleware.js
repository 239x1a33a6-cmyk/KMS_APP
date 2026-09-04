const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? err.status || 500 : res.statusCode;

  if (err.name === "ValidationError") {
    statusCode = 422;
  }

  if (err.name === "CastError") {
    statusCode = 400;
  }

  if (err.code === 11000) {
    statusCode = 409;
  }

  let responseMessage;
  if (err.name === "ValidationError") {
    responseMessage = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.code === 11000) {
    responseMessage = "Email already registered";
  } else {
    responseMessage = err.message || "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
