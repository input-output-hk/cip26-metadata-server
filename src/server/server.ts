import bodyParser from 'body-parser';
import timeout from 'connect-timeout';
import express, { Express } from 'express';

import Environment from './config/environment';
import { Handlers } from './handlers';
import { Logger } from './logger/logger';
import { Middlewares } from './middlewares';
import buildRoutes from './routes/router';

const buildServer = (
  handlers: Handlers,
  middlewares: Middlewares,
  environment: Environment,
  logger: Logger
): Express => {
  const server: Express = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(timeout('30s'));
  server.use((request, response, next) => {
    logger.log.info(`New request: ${request.method} ${request.path}`);
    return next();
  });
  buildRoutes(handlers, middlewares, server);
  return server;
};

export default buildServer;
