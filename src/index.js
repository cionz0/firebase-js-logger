/**
 * A module for creating and configuring a logger with custom formatting and transports.
 * @module logger
 */

const winston = require('winston');

let prefix = '';

/**
 * Sets the prefix to exclude from filename when logging.
 * @param {string} newPrefix - The prefix to exclude from filename when logging.
 */
function setPrefix(newPrefix) {
    prefix = newPrefix || '';
}

/**
 * Creates a new logger instance with optional prefix for filename.
 * @param {string} [newPrefix] - The prefix to exclude from filename when logging.
 * @returns {Object} The configured logger instance with functions for logging at different levels.
 */
function createLogger(newPrefix = '') {
    if (newPrefix) {
        setPrefix(newPrefix);
    }
    const logger = winston.createLogger({
        /**
         * Formats log messages with timestamp, label, level, message, and optionally stack trace.
         * @type {winston.Format}
         */
        format: winston.format.combine(
            winston.format.label({ label: '[MyApp]' }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.printf(({ level, message, label, timestamp, stack }) => {
                let log = `${timestamp} [${label}] ${level}: ${message}`;
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
     * Logs a message with optional stack trace and additional arguments.
     * @private
     * @param {string} level - The log level ('info', 'warn', or 'error').
     * @param {string} message - The message to log.
     * @param {boolean} includeStack - Whether to include the stack trace in the log message.
     * @param {...any} args - Additional arguments to include in the log message.
     */
    const customLog = (level, message, includeStack = false, ...args) => {
        const fileAndLine = formatWithFileAndLine();
        let logMessage = `${fileAndLine} - ${message}`;
        if (includeStack) {
            const stackTrace = new Error().stack;
            logMessage += `\n${stackTrace}`;
        }
        logger.log(level, logMessage, ...args);
    };

    return {
        info,
        warn,
        error,
    };
}

module.exports = {
    createLogger,
    setPrefix,
};
