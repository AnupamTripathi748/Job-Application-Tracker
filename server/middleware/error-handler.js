const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || 500,
    msg: err.message || 'Something went wrong, please try again later',
  };

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = 400; // Bad Request
  }

  // Mongoose duplicate key errors (e.g. email already exists)
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    ).join(', ')} field, please choose another value`;
    customError.statusCode = 400; // Bad Request
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404; // Not Found
  }

  // Log error in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error handled by middleware:', err);
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
