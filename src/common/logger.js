const pino = require('pino');

const loggerOptions = {
  name: 'tokens-service'
};

switch (process.env.NODE_ENV) {
  case 'production':
    loggerOptions.level = 'info'
    break;
  case 'test':
    loggerOptions.level = 'info'
    break;
  case 'development':
  default:
    loggerOptions.level = 'trace'
}

if (process.env.TRACE === 'true') {
  // override trace debug level
  loggerOptions.level = 'trace';
}


const logger = pino(loggerOptions);

module.exports = logger;