import { Express } from 'express';

import { Handlers } from '../handlers';
import { Middlewares } from '../middlewares';

const buildRoutes = (
  { statusHandler, metadataHandler }: Handlers,
  { schemaValidatorMiddleware, signaturesMiddleware, metadataMiddleware }: Middlewares,
  server: Express
) => {
  server.get('/health', statusHandler.getStatus);
  server.post(
    '/metadata',
    [
      schemaValidatorMiddleware.validateSchema,
      signaturesMiddleware.validateSignatures,
      metadataMiddleware.checkSubjectNotExists,
    ],
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
  server.get(
    '/metadata/:subject/property/:propertyName',
    metadataMiddleware.checkSubjectExists,
    metadataHandler.getProperty
  );
  server.post(
    '/metadata/query',
    schemaValidatorMiddleware.validateQueryRequestBody,
    metadataHandler.queryObjects
  );
};

export default buildRoutes;
