import { Express } from 'express';

import { Handlers } from '../handlers';
import { Middlewares } from '../middlewares';

const buildRoutes = (
  { statusHandler }: Handlers,
  { schemaValidatorMiddleware }: Middlewares,
  server: Express
) => {
  server.get('/health', statusHandler.getStatus);
};

export default buildRoutes;
