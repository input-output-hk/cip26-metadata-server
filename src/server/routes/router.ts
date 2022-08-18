import { Express } from 'express';

import { Handlers } from '../handlers';
import { Middlewares } from '../middlewares';

const buildRoutes = (
  { statusHandler, metadataHandler }: Handlers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { schemaValidatorMiddleware }: Middlewares,
  server: Express
) => {
  server.get('/health', statusHandler.getStatus);
  server.get('/random', metadataHandler.getRandomObject);
};

export default buildRoutes;
