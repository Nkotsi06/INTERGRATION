const winston = require('winston');

// -------------------------------------------------------------
// Lesotho local time helper
// -------------------------------------------------------------
// The server internally works in UTC. This formatter is used only
// for console output so the developer sees familiar local time.
const LESOTHO_TZ = 'Africa/Maseru';

function lesothoTime() {
  return new Date().toLocaleString('en-GB', {
    timeZone: LESOTHO_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: lesothoTime }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const time = lesothoTime();
          const level = info.level;
          const message =
            typeof info.message === 'string'
              ? info.message
              : JSON.stringify(info.message);
          return `${level}: ${message} {"timestamp":"${time}"}`;
        })
      ),
    }),
  ],
});

module.exports = logger;