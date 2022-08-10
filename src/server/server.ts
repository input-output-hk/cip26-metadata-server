import bodyParser from 'body-parser';
import timeout from 'connect-timeout';
import express, { Express } from 'express';

import { Handlers } from './handlers';
import buildRoutes from './routes/router';

const buildServer = (handlers: Handlers): Express => {
  const server: Express = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(timeout('30s'));
  buildRoutes(handlers, server);
  return server;
};

export default buildServer;
