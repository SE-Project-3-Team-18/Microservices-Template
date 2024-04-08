const winston = require('winston');
const path = require('path');
const logsConfig = require('../config/logging')

/**
 * Module to be used for logging. Follow singleton pattern, and always use the static function CustomLogger.getInstance().
 * - http logs are written after the response is sent back to user.
 * - db logs are written after the database query returns
 * - error logs log any neccessary errors that are to be logged. see errorHandler for more info.
 */
class CustomLogger {
  static instance = null;

  constructor() {
    const logDirectory = logsConfig.logsDirectory // Set the directory path as needed

    // Create separate loggers for different log types
    this.httpLogger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: path.join(logDirectory, 'http.log'),
          handleExceptions: false, // Do not handle uncaught exceptions
          exitOnError: false, // Do not exit on transport errors
          flags: 'a', // Append to the log file
        }),
      ],
    });

    this.dbLogger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: path.join(logDirectory, 'db.log'),
          handleExceptions: false,
          exitOnError: false,
          flags: 'a',
        }),
      ],
    });

    this.errorLogger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: path.join(logDirectory, 'error.log'),
          handleExceptions: true, // Handle uncaught exceptions
          exitOnError: true, // Exit on transport errors
          flags: 'a', // Append to the error log file
        }),
      ],
    });
  }

  /**
   * To be used instead of initializing the Object. following Singleton pattern.
   * @returns CustomLogger instance
   */
  static getInstance() {
    if (CustomLogger.instance !== null) {
      return CustomLogger.instance;
    } else {
      CustomLogger.instance = new CustomLogger();
      return CustomLogger.instance;
    }
  }

  logHttpRequest(req, res) {
    const startTime = new Date();

    // registering callback for 'finish' event. This event occurs after the response has been sent back to user.
    res.on('finish', () => {
      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      // Log HTTP request details
      this.httpLogger.info({
        type: 'API Request',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        latency: elapsedTime + 'ms',
      });
    });
  }

  logDbQuery(query, values, startTime, error) {
    const endTime = new Date();
    const elapsedTime = endTime - startTime;

    // Log DB query details
    this.dbLogger.info({
      timestamp: new Date().toISOString(),
      query,
      values,
      latency: elapsedTime + 'ms',
      error: error ? error.message : null,
    });
  }

  logError(error, req) {
    const requestPath = req?.originalUrl;
    const timestamp = new Date().toISOString();

    // Log an error with request path and timestamp using the error logger
    this.errorLogger.error({
      type: 'Error',
      timestamp,
      message: error.message,
      stack: error.stack,
      requestPath,
    });
  }
}

module.exports = CustomLogger;
