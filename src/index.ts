import { Express } from 'express';

import Environment from './server/config/environment';
import { configure, Handlers } from './server/handlers';
import { Logger } from './server/logger/logger';
import { buildMiddlewares, Middlewares } from './server/middlewares';
import buildServer from './server/server';

const start = () => {
  const environment: Environment = new Environment();
  let server: Express;
  let handlers: Handlers;
  let middlewares: Middlewares;
  let logger: Logger;
  try {
    logger = new Logger(environment.loggerLevel);
    handlers = configure(logger);
    middlewares = buildMiddlewares(logger);
    server = buildServer(handlers, middlewares, environment, logger);
    server.listen(environment.port, () => {
      logger.log.info(
        `⚡️[server]: Server is running at http://${environment.host}:${environment.port}/`
      );
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};

start();
