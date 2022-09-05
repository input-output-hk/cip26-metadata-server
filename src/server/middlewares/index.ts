import { Logger } from '../logger/logger';
import { Services } from '../services';
import metadataMiddleware, { MetadataMiddleware } from './metadata';
import schemaValidatorMiddleware, { SchemaValidatorMiddleware } from './schema-validator';
import signaturesMiddleware, { SignaturesMiddleware } from './signatures';

export interface Middlewares {
  schemaValidatorMiddleware: SchemaValidatorMiddleware;
  signaturesMiddleware: SignaturesMiddleware;
  metadataMiddleware: MetadataMiddleware;
}

export const buildMiddlewares = (logger: Logger, services: Services): Middlewares => ({
  schemaValidatorMiddleware: schemaValidatorMiddleware(logger),
  metadataMiddleware: metadataMiddleware(logger, services),
  signaturesMiddleware: signaturesMiddleware(logger),
});
