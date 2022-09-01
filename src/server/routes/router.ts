import { Express } from 'express';

import { Handlers } from '../handlers';
import { Middlewares } from '../middlewares';

const buildRoutes = (
  { statusHandler, metadataHandler }: Handlers,
  { schemaValidatorMiddleware, metadataMiddleware }: Middlewares,
  server: Express
) => {
  server.get('/health', statusHandler.getStatus);
  server.post(
    '/metadata',
    [schemaValidatorMiddleware.validateSchema, metadataMiddleware.checkSubjectNotExists],
    metadataHandler.createObject
  );
  server.get(
    '/metadata/:subject',
    metadataMiddleware.checkSubjectExists,
    metadataHandler.getObjectBySubject
  );
  server.get(
    '/metadata/:subject/properties',
    metadataMiddleware.checkSubjectExists,
    metadataHandler.getPropertyNames
  );
  server.put(
    '/metadata/:subject',
    [
      schemaValidatorMiddleware.validateUpdateSchema,
      metadataMiddleware.checkSubjectExists,
      metadataMiddleware.checkSequenceNumbers,
    ],
    metadataHandler.updateObject
  );
};

export default buildRoutes;
