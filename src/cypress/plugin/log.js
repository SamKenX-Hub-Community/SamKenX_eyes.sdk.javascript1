'use strict';
const {Logger, ConsoleLogHandler, NullLogHandler} = require('@applitools/eyes.sdk.core');

const logger = new Logger();
const logHandler = process.env.APPLITOOLS_DEV_MODE
  ? new ConsoleLogHandler(true)
  : new NullLogHandler();

logger.setLogHandler(logHandler);

function log(msg) {
  logger.verbose(msg);
}

module.exports = log;
