import Ajv, { ValidateFunction } from 'ajv';
import { DataValidateFunction } from 'ajv/dist/types';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';

import { ValidationError } from '../errors/error-factory';
import schema from '../helpers/schemas/schema.json';
import { Logger } from '../logger/logger';

export interface SchemaValidatorMiddleware {
  validateSchema(request: Request, response: Response, next: NextFunction);
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

let validateFunction: ValidateFunction;
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
  validateFunction = ajv.compile(schema);
  return validateFunction;
};

const configure = (logger: Logger): SchemaValidatorMiddleware => {
  const validate = getValidateFunction();
  return {
    validateSchema: (request: Request, response: Response, next: NextFunction) => {
      logger.log.info('[Middlewares][validateSchema] Validating json schema');
      if (validate(request.body)) {
        logger.log.info('[Middlewares][validateSchema] Successful json schema validation');
        return next();
      } else {
        return next(new ValidationError(validate.errors));
      }
    },
  };
};

export default configure;
