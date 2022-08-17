import { NextFunction, Request, Response } from 'express';

import { ApiError, ErrorFactory } from './error-factory';

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).send({
      internalCode: error.internalCode,
      message: error.message,
    });
  } else {
    const unmappedError = ErrorFactory.unmappedError(
      `An error occurred for request: ${error.message}`
    );
    response.status(unmappedError.statusCode).send({
      internalCode: unmappedError.internalCode,
      message: unmappedError.message,
    });
  }
};
