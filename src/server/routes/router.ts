import { Express } from 'express';

import { Handlers } from '../handlers';
import { Middlewares } from '../middlewares';

const buildRoutes = (
  { statusHandler, metadataHandler }: Handlers,
  { schemaValidatorMiddleware }: Middlewares,
  server: Express
) => {
  server.get('/health', statusHandler.getStatus);
  server.post('/metadata', schemaValidatorMiddleware.validateSchema, metadataHandler.createObject);
  server.get('/metadata/:subject', metadataHandler.getObjectBySubject);
};

export default buildRoutes;
