import { NextFunction, Request, Response } from 'express';
import { Document } from 'mongodb';

import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { Services } from '../services';

export interface MetadataMiddleware {
  checkSubjectExists(request: Request, response: Response, next: NextFunction);
  checkSubjectNotExists(request: Request, response: Response, next: NextFunction);
}

export interface CustomRequest extends Request {
  metadataObject: Document;
}

const configure = (logger: Logger, services: Services): MetadataMiddleware => {
  return {
    checkSubjectExists: async (request: Request, response: Response, next: NextFunction) => {
      sanitize(request, logger);
      const subject = request.params.subject;
      logger.log.info(
        `[Middlewares][checkSubjectExists] Checking that metadata object with subject '${subject}' exists`
      );
      const metadataObject = await services.databaseService.getObject({ subject });
      if (!metadataObject) {
        logger.log.error(
          `[Middlewares][checkSubjectExists] Metadata object with subject '${subject}' does not exists`
        );
        return next(
          ErrorFactory.subjectNotFoundError(
            `A metadata object with subject '${subject}' does not exists`
          )
        );
      }
      logger.log.info(
        `[Middlewares][checkSubjectExists] Metadata object with subject '${subject}' does exist. Retrieving object`
      );
      const request_ = request as CustomRequest;
      request_.metadataObject = metadataObject;
      return next();
    },

    checkSubjectNotExists: async (request: Request, response: Response, next: NextFunction) => {
      const subject = request.body.subject;
      logger.log.info(
        `[Middlewares][checkSubjectNotExists] Checking that metadata object with subject '${subject}' does not exists`
      );
      const object = await services.databaseService.getObject({ subject });
      if (object) {
        logger.log.error(
          `[Middlewares][checkSubjectNotExists] Metadata object with subject ${subject} already exists`
        );
        return next(
          ErrorFactory.subjectExistsError('A metadata object with that subject already exists')
        );
      }
      logger.log.info(
        `[Middlewares][checkSubjectNotExists] Metadata object with subject '${subject}' does not exist. Creating object`
      );
      return next();
    },
  };
};

const sanitize = (request: Request, logger: Logger) => {
  for (const parameter in request.params) {
    const hasProhibited =
      request.params[parameter].includes('$') || request.params[parameter].includes('.');
    if (hasProhibited) {
      while (request.params[parameter].includes('$') || request.params[parameter].includes('.')) {
        request.params[parameter] = request.params[parameter].replace('$', '_').replace('.', '_');
      }
      logger.log.warn(
        `Incomming request to ${request.path} contains invalid characters in param ${parameter}. Those characters were replaced by '_'`
      );
    }
  }
};

export default configure;
