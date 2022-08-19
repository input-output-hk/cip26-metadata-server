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
  server.post('/metadata', metadataHandler.createObject);
};

export default buildRoutes;
