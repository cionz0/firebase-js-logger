# firebase-js-logger

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-2.0.0-orange)](https://github.com/cionz0/firebase-js-logger)

A Winston-based logger with automatic file and line number tracking, designed for Node.js applications. This logger provides clean, formatted console output with timestamps, log levels, and source code location information.

## Table of Contents

- [Why Use This Logger?](#why-use-this-logger)
- [Features](#features)
- [Installation](#installation)
- [Migration Guide (v1.x → v2.0)](#migration-guide-v1x--v20)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Output Format](#output-format)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Why Use This Logger?

Traditional console logging makes it hard to track down where messages originate in large codebases. This logger solves that problem by:

- 🎯 **Automatically showing file names and line numbers** - No more searching for log statements
- 🧹 **Clean, consistent formatting** - Professional output across your entire application
- 🔍 **Full stack traces on demand** - Debug errors faster with detailed context
- 📦 **Zero configuration** - Works out of the box with sensible defaults
- 🚀 **Production ready** - Built on battle-tested Winston logging library
- 🎯 **Singleton pattern** - Single logger instance across your entire application ensures consistent configuration and reduces overhead

**Before:**
```
Server started
Error: Database connection failed
```

**After:**
```
2025-10-09 14:32:15 [INFO]: /src/server.js:[23] - Server started
2025-10-09 14:32:18 [ERROR]: /src/database.js:[45] - Database connection failed
```

## Features

- ✅ **Automatic source tracking**: Displays filename and line number for each log entry
- ✅ **Configurable prefix removal**: Strip project root paths for cleaner output
- ✅ **Multiple log levels**: `info`, `warn`, and `error`
- ✅ **Stack trace support**: Optional stack traces for error logging
- ✅ **Flexible message types**: Supports strings and automatically stringifies objects, arrays, and other types
- ✅ **Timestamp formatting**: ISO-style timestamps (YYYY-MM-DD HH:mm:ss)
- ✅ **Built on Winston**: Leverages the powerful Winston logging library
- ✅ **Singleton pattern**: Single logger instance ensures consistent configuration across all modules with minimal overhead

## Installation

```bash
npm install --save git+https://github.com/cionz0/firebase-js-logger.git
```

## Migration Guide (v1.x → v2.0)

Version 2.0.0 introduces breaking changes with a new singleton pattern API. Follow this guide to migrate from v1.x to v2.0.

### Breaking Changes

1. **Module Export Changed**: The module now exports a function directly instead of an object
2. **`setPrefix()` Moved**: Now a method on the logger object instead of a module-level export
3. **Singleton Pattern**: Logger is now a singleton - all calls return the same instance

### Migration Steps

#### 1. Update Module Import

**Before (v1.x):**
```javascript
const { createLogger } = require("@cionzo/firebase-js-logger");
const logger = createLogger(__dirname);
```

**After (v2.0):**
```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);
```

Or use auto-detection:
```javascript
const logger = require("@cionzo/firebase-js-logger")(null);
```

#### 2. Update `setPrefix()` Usage

**Before (v1.x):**
```javascript
const { createLogger, setPrefix } = require("@cionzo/firebase-js-logger");
const logger = createLogger(__dirname);

// Later...
setPrefix('/new/path');
```

**After (v2.0):**
```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);

// Later...
logger.setPrefix('/new/path');
```

#### 3. Update Multiple Module Usage

**Before (v1.x):**
```javascript
// app.js
const { createLogger } = require("@cionzo/firebase-js-logger");
const logger = createLogger(__dirname);

// services/database.js
const { createLogger } = require("@cionzo/firebase-js-logger");
const logger = createLogger(); // Creates new instance
```

**After (v2.0):**
```javascript
// app.js
const logger = require("@cionzo/firebase-js-logger")(__dirname);

// services/database.js
const logger = require("@cionzo/firebase-js-logger")(); // Returns same singleton instance
```

#### 4. Update Test Code

**Before (v1.x):**
```javascript
const { createLogger } = require("@cionzo/firebase-js-logger");
// Each test creates its own logger
const logger = createLogger(__dirname);
```

**After (v2.0):**
```javascript
const getLogger = require("@cionzo/firebase-js-logger");
const logger = getLogger(__dirname);

// Use reset() between tests if needed
beforeEach(() => {
    logger.reset();
});
```

### Complete Migration Example

**Before (v1.x):**
```javascript
// app.js
const { createLogger, setPrefix } = require("@cionzo/firebase-js-logger");
const logger = createLogger(__dirname);
logger.info("App started");

// services/database.js
const { createLogger } = require("@cionzo/firebase-js-logger");
const logger = createLogger();
logger.info("Database connected");

// config.js
const { setPrefix } = require("@cionzo/firebase-js-logger");
setPrefix('/new/path');
```

**After (v2.0):**
```javascript
// app.js
const logger = require("@cionzo/firebase-js-logger")(__dirname);
logger.info("App started");

// services/database.js
const logger = require("@cionzo/firebase-js-logger")();
logger.info("Database connected");

// config.js
const logger = require("@cionzo/firebase-js-logger")();
logger.setPrefix('/new/path');
```

### Benefits of v2.0

- **Simpler API**: Direct function call instead of destructuring
- **Auto-detection**: Pass `null` to automatically detect caller's `__dirname`
- **Consistent State**: Singleton ensures all modules share the same logger configuration
- **Better Encapsulation**: `setPrefix()` is now a method on the logger object

### Need Help?

If you encounter issues during migration:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Reference](#api-reference) for the new API
3. Open an issue on [GitHub](https://github.com/cionz0/firebase-js-logger/issues)

## Quick Start

**1. Initialize logger in your main file:**

```javascript
// app.js or index.js
// Option 1: Auto-detect __dirname (recommended)
const logger = require("@cionzo/firebase-js-logger")(null);

// Option 2: Explicitly pass __dirname
const logger = require("@cionzo/firebase-js-logger")(__dirname);

logger.info("Application starting...");
```

**2. Use in any module:**

```javascript
// services/database.js
const logger = require("@cionzo/firebase-js-logger")();

logger.info("Connecting to database...");
logger.warn("Connection pool at 80% capacity");
logger.error("Failed to execute query", true); // with stack trace
```

That's it! The logger automatically tracks which file and line number each message comes from. 

**Note:** All calls to `require("@cionzo/firebase-js-logger")()` return the same singleton instance. The prefix parameter is only used on the first call:
- Pass `null` to auto-detect the caller's `__dirname`
- Pass a string (or `__dirname`) to set a specific prefix
- Pass `''` (empty string) to disable prefix removal

Subsequent calls return the existing instance regardless of the parameter passed.

## API Reference

### Module Export

The module exports a function that returns the singleton logger instance.

**Usage:**
```javascript
const logger = require("@cionzo/firebase-js-logger")([prefix]);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | `string \| null` | No | Path prefix to remove from filenames in log output. If `null`, automatically uses the caller's module `__dirname`. If a non-null string (including empty string), that value is used. Only used on the first call; ignored on subsequent calls. |

**Returns:** The singleton logger instance with methods: `info`, `warn`, `error`, `setPrefix`, and `reset`.

**Important:** This logger follows the singleton pattern. The first call initializes the logger with the optional prefix. All subsequent calls return the same instance, and any prefix parameter is ignored.

**Examples:**
```javascript
// First call - initializes singleton with explicit prefix
const logger = require("@cionzo/firebase-js-logger")(__dirname);

// First call - auto-detect caller's __dirname when prefix is null
const logger = require("@cionzo/firebase-js-logger")(null);

// First call - empty string prefix (no prefix removal)
const logger = require("@cionzo/firebase-js-logger")('');

// Subsequent calls - returns same instance (prefix ignored)
const logger2 = require("@cionzo/firebase-js-logger")('/other/path');
// logger === logger2 (same instance)
```

---

### Logger Object

The logger object returned by the module function provides the following methods:

#### `logger.info(message, ...args)`

Logs an informational message.

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string \| any` | Message to log. Strings are used as-is, other types are JSON stringified |
| `...args` | `any` | Additional arguments passed to Winston (optional) |

**Example:**
```javascript
logger.info("Server started on port 3000");
logger.info({ port: 3000, env: "production" });
```

---

#### `logger.warn(message, ...args)`

Logs a warning message.

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string \| any` | Message to log. Strings are used as-is, other types are JSON stringified |
| `...args` | `any` | Additional arguments passed to Winston (optional) |

**Example:**
```javascript
logger.warn("High memory usage detected");
logger.warn({ memory: "85%", threshold: "80%" });
```

---

#### `logger.error(message, [includeStack], ...args)`

Logs an error message with optional stack trace.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | `string \| any` | - | Message to log. Strings are used as-is, other types are JSON stringified |
| `includeStack` | `boolean` | `false` | Whether to include stack trace (optional) |
| `...args` | `any` | - | Additional arguments passed to Winston (optional) |

**Examples:**
```javascript
// Simple error
logger.error("Database connection failed");

// Error with stack trace
logger.error("Critical failure", true);

// Error with object
logger.error({ code: "ERR_DB", details: "Connection timeout" });

// Error with stack trace and additional context
logger.error("Processing failed", true, { userId: 123 });
```

---

#### `logger.setPrefix(newPrefix)`

Updates the prefix for filename formatting. This can be called at any time to change how file paths are displayed in logs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `newPrefix` | `string` | Yes | The prefix to exclude from filenames in log output |

**Example:**
```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);

// Change prefix later if needed
logger.setPrefix('/Users/username/projects/myapp');
```

---

#### `logger.reset()`

Resets the logger singleton. Primarily useful for testing purposes. After calling this, the next call to get the logger will create a fresh instance with a clean state.

**Note:** This method should generally only be used in test environments. In production code, the singleton pattern ensures a single, consistent logger instance throughout the application lifecycle.

**Example:**
```javascript
// In tests
const getLogger = require("@cionzo/firebase-js-logger");
const logger = getLogger(__dirname);

// ... test code ...

logger.reset(); // Reset singleton for next test
const freshLogger = getLogger(__dirname); // Creates new instance
```

## Output Format

Log messages are formatted as:

```
YYYY-MM-DD HH:mm:ss [LEVEL]: /path/to/file.js:[lineNumber] - message
```

### Example Output

```
2025-10-09 14:32:15 [INFO]: /src/services/auth.js:[45] - User authentication successful
2025-10-09 14:32:18 [WARN]: /src/database/connection.js:[23] - Connection pool at 90% capacity
2025-10-09 14:32:20 [ERROR]: /src/handlers/api.js:[102] - Request failed
Error
    at customLog (/Users/user/project/node_modules/@cionzo/firebase-js-logger/src/index.js:104:32)
    at error (/Users/user/project/node_modules/@cionzo/firebase-js-logger/src/index.js:89:38)
    at processRequest (/Users/user/project/src/handlers/api.js:102:12)
    ...
```

## Usage Examples

### Basic Logging

```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);

logger.info("Application initialized");
logger.warn("Configuration file not found, using defaults");
logger.error("Failed to connect to database");
```

**Output:**
```
2025-10-09 14:30:00 [INFO]: /src/app.js:[5] - Application initialized
2025-10-09 14:30:01 [WARN]: /src/app.js:[6] - Configuration file not found, using defaults
2025-10-09 14:30:02 [ERROR]: /src/app.js:[7] - Failed to connect to database
```

---

### Logging Objects and Arrays

Objects and arrays are automatically stringified for easy debugging:

```javascript
const user = { id: 123, name: "John Doe", role: "admin" };
logger.info(user);

const errors = ["Validation failed", "Missing required field"];
logger.error(errors);

const config = { host: "localhost", port: 5432, ssl: true };
logger.warn(config);
```

**Output:**
```
2025-10-09 14:32:15 [INFO]: /src/app.js:[10] - {"id":123,"name":"John Doe","role":"admin"}
2025-10-09 14:32:16 [ERROR]: /src/app.js:[14] - ["Validation failed","Missing required field"]
2025-10-09 14:32:17 [WARN]: /src/app.js:[17] - {"host":"localhost","port":5432,"ssl":true}
```

---

### Error Logging with Stack Trace

Enable stack traces for critical errors to get full context:

```javascript
try {
    // Some risky operation
    const result = riskyFunction();
} catch (err) {
    // Log with stack trace for debugging
    logger.error(err.message, true);
}

// Or log critical failures with full trace
if (!criticalResource) {
    logger.error("Critical resource unavailable", true);
}
```

---

### Multi-Module Application

The singleton pattern ensures all modules share the same logger instance:

**app.js (main entry point):**
```javascript
// Initialize singleton with prefix on first call
const logger = require("@cionzo/firebase-js-logger")(__dirname);

logger.info("Starting application...");

// Initialize services
require('./services/database');
require('./services/cache');
require('./api/server');

logger.info("All services initialized");
```

**services/database.js:**
```javascript
// Returns the same singleton instance (prefix parameter ignored)
const logger = require("@cionzo/firebase-js-logger")();

async function connect() {
    logger.info("Connecting to database...");
    try {
        await db.connect();
        logger.info("Database connected successfully");
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`, true);
        throw error;
    }
}
```

**api/server.js:**
```javascript
// Same singleton instance - consistent configuration across all modules
const logger = require("@cionzo/firebase-js-logger")();

app.listen(3000, () => {
    logger.info("Server listening on port 3000");
});

app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, true);
    res.status(500).send('Internal Server Error');
});
```

---

### Structured Logging for Analytics

```javascript
// Log structured data for easy parsing and analytics
logger.info({
    event: "user_login",
    userId: 12345,
    timestamp: Date.now(),
    ip: req.ip,
    userAgent: req.headers['user-agent']
});

logger.warn({
    event: "rate_limit_exceeded",
    userId: 12345,
    endpoint: "/api/data",
    attempts: 150,
    limit: 100
});
```

## Best Practices

### 1. Initialize Logger Once in Main File

The singleton pattern means you should initialize the logger once in your main application file:

```javascript
// ✅ Good - Initialize singleton in main file with __dirname
// This sets the prefix for all subsequent logs
const logger = require("@cionzo/firebase-js-logger")(__dirname);
```

```javascript
// ✅ Good - Other modules get the same singleton instance
// The prefix parameter is ignored since logger is already initialized
const logger = require("@cionzo/firebase-js-logger")();
```

```javascript
// ❌ Avoid - Don't pass prefix in every module (it's ignored anyway)
// The prefix only takes effect on the very first call
const logger = require("@cionzo/firebase-js-logger")(__dirname); // prefix ignored
```

**Tip:** Store the logger in a variable if you need to access methods like `setPrefix()` or `reset()`:
```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);
// Later, if needed:
logger.setPrefix('/new/path');
```

### 2. Use Appropriate Log Levels

```javascript
// ✅ Good - Use appropriate levels
logger.info("Normal operation messages");
logger.warn("Warnings that need attention but aren't critical");
logger.error("Errors that affect functionality");
```

```javascript
// ❌ Avoid - Don't use wrong levels
logger.error("User logged in"); // This is not an error
logger.info("Database connection failed"); // This should be error
```

### 3. Enable Stack Traces for Critical Errors Only

```javascript
// ✅ Good - Use stack traces for debugging critical issues
logger.error("Fatal error in payment processing", true);
```

```javascript
// ❌ Avoid - Don't use stack traces for every error
logger.error("Invalid input", true); // Unnecessary stack trace
```

### 4. Log Structured Data for Important Events

```javascript
// ✅ Good - Structured data for analytics
logger.info({ event: "purchase", amount: 99.99, userId: 123 });
```

```javascript
// ❌ Avoid - Unstructured strings for important events
logger.info("User 123 purchased something for $99.99");
```

### 5. Don't Log Sensitive Information

```javascript
// ✅ Good - Sanitize sensitive data
logger.info({ userId: user.id, action: "login" });
```

```javascript
// ❌ Avoid - Never log passwords, tokens, or PII
logger.info({ user: user, password: "secret123" });
```

## Troubleshooting

### File paths show full absolute paths

**Problem:** Logs show `/Users/username/project/src/app.js` instead of `/src/app.js`

**Solution:** Make sure to initialize the logger singleton with `__dirname` in your main file (first call only):
```javascript
const logger = require("@cionzo/firebase-js-logger")(__dirname);
```

Or update the prefix later:
```javascript
const logger = require("@cionzo/firebase-js-logger")();
logger.setPrefix(__dirname);
```

---

### Stack traces not showing

**Problem:** Error logs don't include stack traces

**Solution:** Pass `true` as the second parameter to `logger.error()`:
```javascript
logger.error("Error message", true);
```

---

### Logger not found in modules

**Problem:** `Cannot find module '@cionzo/firebase-js-logger'`

**Solution:** Ensure the package is installed correctly:
```bash
npm install --save git+https://github.com/cionz0/firebase-js-logger.git
```

---

### Different logger instances in different modules

**Problem:** Expected singleton behavior but getting different instances

**Solution:** Make sure you're calling the module function correctly. The module exports a function that must be invoked:
```javascript
// ✅ Correct - function is called, returns singleton instance
const logger = require("@cionzo/firebase-js-logger")();

// ❌ Incorrect - function is not called, returns the function itself
const logger = require("@cionzo/firebase-js-logger");
```

---

### Prefix not being applied

**Problem:** Prefix passed on subsequent calls doesn't take effect

**Solution:** The prefix is only used on the first call. If you need to change the prefix later, use the `setPrefix()` method:
```javascript
// First call - prefix is set
const logger = require("@cionzo/firebase-js-logger")(__dirname);

// Later, change prefix
logger.setPrefix('/new/path');

// Or if logger was already initialized without prefix:
const logger = require("@cionzo/firebase-js-logger")();
logger.setPrefix(__dirname); // Set prefix after initialization
```

---

### Timestamps in wrong timezone

**Problem:** Log timestamps don't match your local timezone

**Solution:** Timestamps are in your server's local time. For UTC or specific timezones, you can modify the logger format or use environment variables to set the timezone.

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development

```bash
# Clone the repository
git clone https://github.com/cionz0/firebase-js-logger.git
cd firebase-js-logger

# Install dependencies
npm install

# Run tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

## License

GPL-3.0 - see the [LICENSE](LICENSE) file for details

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

## Author

**cionz0**
- Email: cionzoh@gmail.com
- GitHub: [@cionz0](https://github.com/cionz0)

## Links

- [GitHub Repository](https://github.com/cionz0/firebase-js-logger)
- [Report Issues](https://github.com/cionz0/firebase-js-logger/issues)
- [Winston Documentation](https://github.com/winstonjs/winston)

---

⭐ If you find this package useful, please consider giving it a star on GitHub!
