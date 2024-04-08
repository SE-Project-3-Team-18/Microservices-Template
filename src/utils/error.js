const CustomLogger = require('./logger')

class CustomError extends Error {
  /**
   * @param {string} message
   * @param {Number} errorCode
   * @param {Boolean} logError - specify whether to log the error, or continue without logging
   */
  constructor(message, errorCode, logError = false) {
    super(message);

    // This ensure registering of stack trace with this class name. Thereby helping in debugging
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.logError = logError;
  }
}

/**
 * Handles what response to send back to the user based on the error type.
 * @param {*} err error
 * @param {*} req http req
 * @param {*} res http res
 * @param {*} next
 */
const errorHandler = (err, req, res, next) => {
  const shouldLogError = err.logError
  if (
    shouldLogError === true ||
    shouldLogError === undefined
  ) {
    CustomLogger.getInstance().logError(err)
  }
  let message = null
  if (shouldLogError === true) {
    // depicting that the error should be logged, i.e some internal server error. i.e not to be sent to user.
    message = 'An application error occurred'
  } else {
    // depicting that error should not be logged, i.e it has to be sent to user.
    if (err.message !== null) {
      // if err.message exists, then send it to user.
      message = err.message
    } else {
      // Otherwise fallback to the message 'An application error occurred'
      message = 'An application error occurred'
    }
  }
  let errorCode = null
  if (err.errorCode) {
    errorCode = err.errorCode
  } else {
    // If error code doesnt exist, then it must be internal error.
    errorCode = 500
  }

  res
    .status(errorCode)
    .json({
      success: false,
      message,
    });
};

module.exports = {
  CustomError,
  errorHandler,
}
