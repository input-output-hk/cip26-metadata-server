import { Logger } from '../logger/logger';
import { Services } from '../services';
import metadataMiddleware, { MetadataMiddleware } from './metadata';
import schemaValidatorMiddleware, { SchemaValidatorMiddleware } from './schema-validator';

export interface Middlewares {
  schemaValidatorMiddleware: SchemaValidatorMiddleware;
  metadataMiddleware: MetadataMiddleware;
}

export const buildMiddlewares = (logger: Logger, services: Services): Middlewares => ({
  schemaValidatorMiddleware: schemaValidatorMiddleware(logger),
  metadataMiddleware: metadataMiddleware(logger, services),
});
