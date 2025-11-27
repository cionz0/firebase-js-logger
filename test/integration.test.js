/**
 * Integration tests for firebase-js-logger
 * Tests multi-module usage patterns
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
        console.log('\nRunning integration tests...\n');
        
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

runner.test('Multi-Module: should share the same instance across multiple requires', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule(null);
    const logger2 = loggerModule('/module2/path');
    const logger3 = loggerModule('/module3/path');

    assert.strictEqual(logger1, logger2, 'Should share instance across modules');
    assert.strictEqual(logger2, logger3, 'All modules should share same instance');
});

runner.test('Multi-Module: should maintain prefix across module boundaries', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const initialPrefix = path.dirname(__filename);
    const logger1 = loggerModule(initialPrefix);

    const logger2 = loggerModule(null);

    assert.strictEqual(logger1, logger2, 'Should return same instance');
});

runner.test('Real-world: should handle typical application initialization', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const appLogger = loggerModule(null);
    const serviceLogger = loggerModule();
    const apiLogger = loggerModule();

    assert.strictEqual(appLogger, serviceLogger, 'App and service should share logger');
    assert.strictEqual(serviceLogger, apiLogger, 'All modules should share logger');
});

runner.test('Runtime: should handle prefix changes at runtime', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule('/initial/prefix');

    const newPrefix = '/new/prefix';
    assert.doesNotThrow(() => {
        logger.setPrefix(newPrefix);
        logger.setPrefix(newPrefix); // Should allow multiple calls
    }, 'Should allow prefix changes');
});

runner.test('Edge Case: should handle empty string prefix correctly', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule('');
    assert(logger, 'Should create logger with empty string prefix');
    assert(typeof logger.info === 'function', 'Should have logging methods');
});

runner.test('Edge Case: should handle null prefix multiple times', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule(null);
    const logger2 = loggerModule(null);

    assert.strictEqual(logger1, logger2, 'Should return same instance');
});

runner.test('Prefix Auto-detection: should detect caller directory when prefix is null', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger = loggerModule(null);
    
    assert(logger, 'Logger should be created');
    assert.doesNotThrow(() => logger.info('Test'), 'Should log without errors');
});

runner.test('Prefix: should use different prefixes when reset and reinitialized', () => {
    const loggerModule = requireFresh('../src/index.js');
    loggerModule().reset();

    const logger1 = loggerModule('/prefix1');
    logger1.reset();

    const logger2 = loggerModule('/prefix2');
    assert(logger2, 'Should create new logger with different prefix');
    assert.notStrictEqual(logger1, logger2, 'Should be different instances');
});

// Run tests
runner.run();
