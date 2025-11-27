/**
 * Test suite for firebase-js-logger
 * Uses Node.js built-in assert module
 */

const assert = require('assert');
const path = require('path');

// Helper to require a fresh module instance for testing
function requireFresh(modulePath) {
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
}

// Simple test runner
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('\nRunning tests...\n');
        
        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✓ ${name}`);
                this.passed++;
            } catch (error) {
                console.error(`✗ ${name}`);
                console.error(`  ${error.message}`);
                if (error.stack) {
                    console.error(`  ${error.stack.split('\n')[1].trim()}`);
                }
                this.failed++;
            }
        }

        console.log(`\n${this.passed} passed, ${this.failed} failed\n`);
        process.exit(this.failed > 0 ? 1 : 0);
    }
}

const runner = new TestRunner();

// Helper to capture console output
function captureConsoleLog(fn) {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);
    const logs = [];

    process.stdout.write = (chunk, encoding, fd) => {
        if (typeof chunk === 'string') {
            logs.push({ type: 'log', message: chunk });
        }
        return originalStdoutWrite(chunk, encoding, fd);
    };

    process.stderr.write = (chunk, encoding, fd) => {
        if (typeof chunk === 'string') {
            logs.push({ type: 'error', message: chunk });
        }
        return originalStderrWrite(chunk, encoding, fd);
    };

    try {
        fn();
    } finally {
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;
    }

    return logs;
}

// Tests
runner.test('Singleton: should return the same instance on multiple calls', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule(null);
    const logger2 = loggerModule('/some/path');
    const logger3 = loggerModule();

    assert.strictEqual(logger1, logger2, 'Multiple calls should return same instance');
    assert.strictEqual(logger2, logger3, 'All calls should return same instance');
});

runner.test('Singleton: should ignore prefix parameter after first call', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule('/first/prefix');
    const logger2 = loggerModule('/second/prefix');

    assert.strictEqual(logger1, logger2, 'Should return same instance');
});

runner.test('Prefix: should auto-detect __dirname when prefix is null', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule(null);
    
    assert(logger, 'Logger should be created');
    assert(typeof logger.info === 'function', 'Should have info method');
});

runner.test('Prefix: should use provided string prefix', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const testPrefix = '/test/prefix';
    const logger = loggerModule(testPrefix);
    
    assert(logger, 'Logger should be created');
});

runner.test('Prefix: should use empty string prefix when provided', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule('');
    
    assert(logger, 'Logger should be created');
});

runner.test('Logger Methods: should have all required methods', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    assert(typeof logger.info === 'function', 'Should have info method');
    assert(typeof logger.warn === 'function', 'Should have warn method');
    assert(typeof logger.error === 'function', 'Should have error method');
    assert(typeof logger.setPrefix === 'function', 'Should have setPrefix method');
    assert(typeof logger.reset === 'function', 'Should have reset method');
});

runner.test('Logger Methods: should log info messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.info('Test info message');
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes('[INFO]'), 'Should contain INFO level');
    assert(allMessages.includes('Test info message'), 'Should contain message');
});

runner.test('Logger Methods: should log warn messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.warn('Test warn message');
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes('[WARN]'), 'Should contain WARN level');
    assert(allMessages.includes('Test warn message'), 'Should contain message');
});

runner.test('Logger Methods: should log error messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.error('Test error message');
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes('[ERROR]'), 'Should contain ERROR level');
    assert(allMessages.includes('Test error message'), 'Should contain message');
});

runner.test('Logger Methods: should log error with stack trace when requested', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.error('Test error with stack', true);
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes('[ERROR]'), 'Should contain ERROR level');
    assert(allMessages.includes('Test error with stack'), 'Should contain message');
    assert(allMessages.includes('Error'), 'Should contain stack trace');
});

runner.test('Logger Methods: should stringify non-string messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const testObject = { key: 'value', number: 123 };
    const logs = captureConsoleLog(() => {
        logger.info(testObject);
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes(JSON.stringify(testObject)), 'Should stringify object');
});

runner.test('Logger Methods: should handle array messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const testArray = ['item1', 'item2'];
    const logs = captureConsoleLog(() => {
        logger.info(testArray);
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    assert(allMessages.includes(JSON.stringify(testArray)), 'Should stringify array');
});

runner.test('Reset: should reset the singleton instance', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule(null);
    logger1.reset();

    const logger2 = loggerModule(null);
    
    assert.notStrictEqual(logger1, logger2, 'Should create new instance after reset');
});

runner.test('Reset: should allow reinitializing after reset', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule('/first/prefix');
    logger1.reset();

    const logger2 = loggerModule('/second/prefix');
    assert(logger2, 'Should create new logger after reset');
});

runner.test('File and Line: should include file and line number in log messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.info('Test message');
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    // Should contain filename and line number in format: filename:[lineNumber]
    assert(/\w+\.\w+:\[\d+\]/.test(allMessages), 'Should contain file and line number');
});

runner.test('Timestamp: should include timestamp in log messages', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    const logs = captureConsoleLog(() => {
        logger.info('Test message');
    });

    const allMessages = logs.map(log => log.message).join('');
    assert(logs.length > 0 || allMessages.length > 0, 'Should log message');
    // Should contain timestamp in format: YYYY-MM-DD HH:mm:ss
    assert(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(allMessages), 'Should contain timestamp');
});

runner.test('setPrefix: should allow changing prefix at runtime', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();
    const logger = loggerModule(null);

    assert.doesNotThrow(() => {
        logger.setPrefix('/new/prefix');
    }, 'Should allow prefix changes');
});

runner.test('Edge Case: should handle undefined prefix', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule();
    assert(logger, 'Should create logger with undefined prefix');
});

runner.test('Edge Case: should handle multiple reset calls', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule(null);
    logger1.reset();

    const logger2 = loggerModule(null);
    logger2.reset();

    const logger3 = loggerModule(null);
    
    assert.notStrictEqual(logger1, logger3, 'Should create new instance after resets');
    assert.notStrictEqual(logger2, logger3, 'Should create new instance after resets');
});

// Run tests
runner.run();
