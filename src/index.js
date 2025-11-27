/**
 * A module for creating and configuring a logger with custom formatting and transports.
 * Implements a singleton pattern to ensure a single logger instance across the application.
 * @module logger
 */

const winston = require('winston');
const path = require('path');

// Module-level variables for singleton pattern
let loggerInstance = null;
let prefix = '';

/**
 * Creates the logger instance with custom formatting and transports.
 * This function is called only once to initialize the singleton.
 * @private
 * @param {string} initialPrefix - The prefix to exclude from filename when logging.
 * @returns {Object} The configured logger instance with functions for logging at different levels.
 */
function createLoggerInstance(initialPrefix = '') {
    // Set prefix on first initialization only
    if (initialPrefix) {
        prefix = initialPrefix;
    }

    const winstonLogger = winston.createLogger({
        /**
         * Formats log messages with timestamp, label, level, message, and optionally stack trace.
         * @type {winston.Format}
         */
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.printf(({ level, message, label, timestamp, stack }) => {
                let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
                if (stack) {
                    log += `\n${stack}`;
                }
                return log;
            })
        ),
        transports: [
            new winston.transports.Console()
        ]
    });

    /**
     * Retrieves the filename and line number of the calling code, excluding the prefix.
     * @private
     * @param {number} [depth=3] - The stack depth to retrieve the caller's filename and line number.
     * @returns {string} The filename and line number in the format "filename:lineNumber".
     */
    function formatWithFileAndLine(depth = 3) {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const stack = new Error().stack.slice(depth);
        Error.prepareStackTrace = originalPrepareStackTrace;
        const callee = stack[0];
        let fileName = callee.getFileName();
        if (prefix && fileName.startsWith(prefix)) {
            fileName = fileName.substring(prefix.length);
        }
        return `${fileName}:[${callee.getLineNumber()}]`;
    }

    /**
     * Logs a message with optional stack trace and additional arguments.
     * @private
     * @param {string} level - The log level ('info', 'warn', or 'error').
     * @param {any} message - The message to log.
     * @param {boolean} includeStack - Whether to include the stack trace in the log message.
     * @param {...any} args - Additional arguments to include in the log message.
     */
    const customLog = (level, message, includeStack = false, ...args) => {
        const fileAndLine = formatWithFileAndLine();
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        let logMessage = `${fileAndLine} - ${messageStr}`;
        if (includeStack) {
            const stackTrace = new Error().stack;
            logMessage += `\n${stackTrace}`;
        }
        winstonLogger.log(level, logMessage, ...args);
    };

    /**
     * Logs a message at the "info" level.
     * @param {string} message - The message to log.
     * @param {...any} [args] - Additional arguments to include in the log message.
     */
    const info = (message, ...args) => customLog('info', message, false, ...args);

    /**
     * Logs a message at the "warn" level.
     * @param {string} message - The message to log.
     * @param {...any} [args] - Additional arguments to include in the log message.
     */
    const warn = (message, ...args) => customLog('warn', message, false, ...args);

    /**
     * Logs a message at the "error" level.
     * @param {string} message - The message to log.
     * @param {boolean} [includeStack=false] - Whether to include the stack trace in the log message.
     * @param {...any} [args] - Additional arguments to include in the log message.
     */
    const error = (message, includeStack = false, ...args) => customLog('error', message, includeStack, ...args);

    /**
     * Sets the prefix to exclude from filename when logging.
     * @param {string} newPrefix - The prefix to exclude from filename when logging.
     */
    const setPrefix = (newPrefix) => {
        prefix = newPrefix || '';
    };

    /**
     * Resets the logger instance. Primarily for testing purposes.
     * This clears the singleton, allowing a fresh logger to be created.
     */
    const reset = () => {
        loggerInstance = null;
        prefix = '';
    };

    return {
        info,
        warn,
        error,
        setPrefix,
        reset,
    };
}

/**
 * Gets the directory name of the caller's file.
 * @private
 * @returns {string} The directory path of the caller's file.
 */
function getCallerDirname() {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = new Error().stack.slice(2); // Skip getCallerDirname and getLogger
    Error.prepareStackTrace = originalPrepareStackTrace;
    const caller = stack[0];
    const fileName = caller.getFileName();
    return path.dirname(fileName);
}

/**
 * Gets the singleton logger instance. On first call, initializes the logger with optional prefix.
 * Subsequent calls return the same instance (prefix parameter is ignored).
 * 
 * @param {string|null} [prefix] - The prefix to exclude from filenames in log output.
 *                                  If `null`, automatically uses the caller's module `__dirname`.
 *                                  If a non-null string (including empty string), that value is used.
 *                                  Only used on the first call; ignored on subsequent calls.
 * @returns {Object} The singleton logger instance with methods: info, warn, error, setPrefix, reset
 * 
 * @example
 * // First call - initializes singleton with prefix
 * const logger = require('@cionzo/firebase-js-logger')(__dirname);
 * 
 * // First call - automatically uses caller's __dirname when prefix is null
 * const logger = require('@cionzo/firebase-js-logger')(null);
 * 
 * // First call - empty string prefix
 * const logger = require('@cionzo/firebase-js-logger')('');
 * 
 * // Subsequent calls - returns same instance, prefix ignored
 * const logger2 = require('@cionzo/firebase-js-logger')('/other/path');
 * // logger === logger2 (same instance)
 */
function getLogger(prefix = '') {
    if (!loggerInstance) {
        let actualPrefix = prefix;
        // If prefix is null, use caller's __dirname
        if (prefix === null) {
            actualPrefix = getCallerDirname();
        }
        // If prefix is a non-null value (including empty string), use it as-is
        loggerInstance = createLoggerInstance(actualPrefix);
    }
    return loggerInstance;
}

module.exports = getLogger;
