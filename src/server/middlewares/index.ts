import { Logger } from '../logger/logger';
import schemaValidatorMiddleware, { SchemaValidatorMiddleware } from './schema-validator';

export interface Middlewares {
  schemaValidatorMiddleware: SchemaValidatorMiddleware;
}

export const buildMiddlewares = (logger: Logger): Middlewares => ({
  schemaValidatorMiddleware: schemaValidatorMiddleware(logger),
});
