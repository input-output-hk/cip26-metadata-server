import winston from 'winston';
import { DEFAULT_LOGGER_LEVEL } from '../utils/constants';

class Logger {
  log: winston.Logger;

  constructor(level: string | undefined) {
    this.log = winston.createLogger({
      level: level || DEFAULT_LOGGER_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
      transports: [new winston.transports.Console()],
    });
  }
}


export { Logger };
