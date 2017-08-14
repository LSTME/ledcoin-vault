const winston = require('winston');

const logger = new winston.Logger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
    }),
  ],
});

logger.stream = {
  write(message) {
    logger.info('express', message.trim());
  },
};

module.exports = logger;

