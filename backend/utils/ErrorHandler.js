class ErrorHandler extends Error {
  constructor(message, statusCode) {
    // Call the parent Error class
    super(message);
    // Store the HTTP status code (400, 404, 500...)
    this.statusCode = statusCode;
    // Optional: Capture clean stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
