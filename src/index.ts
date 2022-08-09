import MetadataHandler from './server/handlers/metadata';
import buildServer from './server/server';
import Environment from "./config/environment"

const environment: Environment = new Environment();
const start = () => {
  let server;
  let handlers;
  try {
    handlers = new MetadataHandler({ db: null });
    server = buildServer(handlers, environment);
    server.listen(environment.port, () => {
      console.log(`⚡️[server]: Server is running at http://${environment.host}:${environment.port}/metadata`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();