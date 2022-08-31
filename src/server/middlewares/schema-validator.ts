import Ajv from 'ajv';
import { DataValidateFunction } from 'ajv/dist/types';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';

import { ValidationError } from '../errors/error-factory';
import queryRequestBodySchema from '../helpers/schemas/query-request-body.json';
import schema from '../helpers/schemas/schema.json';
import { Logger } from '../logger/logger';

export interface SchemaValidatorMiddleware {
  validateSchema(request: Request, response: Response, next: NextFunction);
  validateQueryRequestBody(request: Request, response: Response, next: NextFunction);
}

const validateBase64: DataValidateFunction = (value) => {
  const base64RE = new RegExp('^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');
  if (base64RE.test(value)) {
    return true;
  }
  validateBase64.errors = [
    ...(validateBase64.errors || []),
    {
      keyword: 'contentEncoding',
      message: 'invalid base64-encoded data',
    },
  ];
  return false;
};

const validateBase16: DataValidateFunction = (value) => {
  const base16RE = new RegExp('^[0-9a-fA-F]+$');
  if (base16RE.test(value)) {
    return true;
  }
  validateBase16.errors = [
    ...(validateBase16.errors || []),
    {
      keyword: 'contentEncoding',
      message: 'invalid base16-encoded data',
    },
  ];
  return false;
};

const getValidateFunction = () => {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.removeKeyword('contentEncoding');
  ajv.addKeyword({
    keyword: 'contentEncoding',
    compile: (schema) => {
      switch (schema) {
        case 'base64':
          return validateBase64;
        case 'base16':
          return validateBase16;
        default:
          return () => true;
      }
    },
    errors: true,
  });
  return ajv.compile(schema);
};

const getValidateQueryFunction = () => {
  const ajv = new Ajv({ strict: false, allErrors: true });
  return ajv.compile(queryRequestBodySchema);
};

const configure = (logger: Logger): SchemaValidatorMiddleware => {
  const validate = getValidateFunction();
  const validateQuery = getValidateQueryFunction();
  return {
    validateSchema: (request: Request, response: Response, next: NextFunction) => {
      logger.log.info('[Middlewares][validateSchema] Validating json schema');
      if (validate(request.body)) {
        logger.log.info('[Middlewares][validateSchema] Successful json schema validation');
        return next();
      } else {
        logger.log.error('[Middlewares][validateSchema] Errors found in json schema validation');
        return next(new ValidationError(validate.errors));
      }
    },

    validateQueryRequestBody: (request: Request, response: Response, next: NextFunction) => {
      logger.log.info('[Middlewares][validateQueryRequestBody] Validating query request body');
      if (validateQuery(request.body)) {
        logger.log.info(
          '[Middlewares][validateQueryRequestBody] Successful query request body validation'
        );
        return next();
      } else {
        logger.log.error(
          '[Middlewares][validateQueryRequestBody] Errors found in query request body validation'
        );
        return next(new ValidationError(validateQuery.errors));
      }
    },
  };
};

export default configure;
