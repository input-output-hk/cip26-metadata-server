import { Express } from 'express'
import buildServer from './server/server';
import Environment from "./config/environment"

import { configure, Handlers } from './server/handlers'
import { Logger } from './logger/logger';


const start = () => {
  const environment: Environment = new Environment();
  let server: Express;
  let handlers: Handlers;
  let logger: Logger;
  try {
    logger = new Logger(environment.loggerLevel);
    handlers = configure(logger)
    server = buildServer(handlers, environment, logger);
    server.listen(environment.port, () => {
      logger.log.info(`⚡️[server]: Server is running at http://${environment.host}:${environment.port}/`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();