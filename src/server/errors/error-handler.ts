import { NextFunction, Request, Response } from 'express';

import { ApiError, ErrorFactory, ValidationError } from './error-factory';

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof ApiError) {
    return response
      .status(error.statusCode)
      .send({ internalCode: error.internalCode, message: error.message });
  }
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error.validationErrors);
  }
  const unmappedError = ErrorFactory.unmappedError(
    `An error occurred for request: ${error.message}`
  );
  return response.status(unmappedError.statusCode).send({
    internalCode: unmappedError.internalCode,
    message: unmappedError.message,
  });
};
