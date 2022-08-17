import { Express } from 'express';
import { Db } from 'mongodb';

import Environment from './server/config/environment';
import { connectToDatabase } from './server/db';
import { configure as configureHandlers, Handlers } from './server/handlers';
import { Logger } from './server/logger/logger';
import { buildMiddlewares, Middlewares } from './server/middlewares';
import buildServer from './server/server';
import { configure as configureServices, Services } from './server/services';

const start = async () => {
  const environment: Environment = new Environment();
  let server: Express;
  let handlers: Handlers;
  let middlewares: Middlewares;
  let services: Services;
  let logger: Logger;
  let database: Db;
  try {
    logger = new Logger(environment.loggerLevel);
    database = await connectToDatabase(environment, logger);
    services = configureServices(logger, database);
    handlers = configureHandlers(logger, services);
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
