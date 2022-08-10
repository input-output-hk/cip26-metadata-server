import { Express } from 'express';

import Environment from './config/environment';
import { configure, Handlers } from './server/handlers';
import buildServer from './server/server';

const environment: Environment = new Environment();
const start = () => {
  let server: Express;
  let handlers: Handlers;
  try {
    handlers = configure();
    server = buildServer(handlers);
    server.listen(environment.port, () => {
      console.log(
        `⚡️[server]: Server is running at http://${environment.host}:${environment.port}/`
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
