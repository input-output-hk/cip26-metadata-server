import { Express } from 'express';
import { Db } from 'mongodb';
import { Server } from 'node:http';

import Environment from '../../src/server/config/environment';
import { connectToDatabase } from '../../src/server/db';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import { buildMiddlewares, Middlewares } from '../../src/server/middlewares';
import buildServer from '../../src/server/server';
import { configure as configureServices, Services } from '../../src/server/services';

let app: Express, database: Db, environment: Environment, server: Server, services: Services;

export default async () => {
  if (process.env.NODE_ENV !== 'integration') {
    return;
  }
  environment = new Environment();
  const logger = new Logger(environment.loggerLevel);
  logger.log.info('[Global][Setup] launching in-memory mongodb server...');
  // eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-var-requires
  await require('@shelf/jest-mongodb/lib/setup.js')();

  logger.log.info('[Global][Setup] launching http server...');
  environment.dbUri = process.env.MONGO_URL;
  database = await connectToDatabase(environment, logger);
  services = configureServices(logger, database);
  const handlers: Handlers = configure(logger, services);
  const middlewares: Middlewares = buildMiddlewares(logger, services);
  app = buildServer(handlers, middlewares, environment, logger);
  server = app.listen(environment.port);

  process.env.TEST_CONNECTION_STRING = environment.connectionString;
  global.__SERVER__ = server;
};
