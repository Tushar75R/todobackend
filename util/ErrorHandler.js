const errorMiddleware = (err, req, res, next) => {
  err.message ||= "Internal server error";
  let status = err.cause?.status || 500;

  const response = {
    success: false,
    message: err.message,
  };

  return res.status(status).json(response);
};

const ErrorHandler = (message, status) => {
  return new Error(message, { cause: { status } });
};

export { errorMiddleware, ErrorHandler };
