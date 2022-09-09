import { NextFunction, Response } from 'express';
import { Document } from 'mongodb';
import { Request } from 'request-id/express';

import { Entry } from '../../types/metadata';
import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { Services } from '../services';

export interface MetadataMiddleware {
  checkSubjectExists(request: Request, response: Response, next: NextFunction);
  checkSubjectNotExists(request: Request, response: Response, next: NextFunction);
  checkSequenceNumbers(request: Request, response: Response, next: NextFunction);
}

export interface CustomRequest extends Request {
  metadataObject: Document;
}

const configure = (logger: Logger, services: Services): MetadataMiddleware => {
  return {
    checkSubjectExists: async (request: Request, response: Response, next: NextFunction) => {
      const subject = request.params.subject;
      logger.log.info(
        `[${request.requestId}][Middleware][checkSubjectExists] Checking that metadata object with subject '${subject}' exists`
      );
      const metadataObject = await services.databaseService.getObject({ subject });
      if (!metadataObject) {
        logger.log.error(
          `[${request.requestId}][Middleware][checkSubjectExists] Metadata object with subject '${subject}' does not exists`
        );
        return next(
          ErrorFactory.subjectNotFoundError(
            `A metadata object with subject '${subject}' does not exists`
          )
        );
      }
      logger.log.info(
        `[${request.requestId}][Middleware][checkSubjectExists] Metadata object with subject '${subject}' does exist. Retrieving object`
      );
      const request_ = request as CustomRequest;
      request_.metadataObject = metadataObject;
      return next();
    },

    checkSubjectNotExists: async (request: Request, response: Response, next: NextFunction) => {
      const subject = request.body.subject;
      logger.log.info(
        `[${request.requestId}][Middleware][checkSubjectNotExists] Checking that metadata object with subject '${subject}' does not exists`
      );
      const object = await services.databaseService.getObject({ subject });
      if (object) {
        logger.log.error(
          `[${request.requestId}][Middleware][checkSubjectNotExists] Metadata object with subject ${subject} already exists`
        );
        return next(
          ErrorFactory.subjectExistsError('A metadata object with that subject already exists')
        );
      }
      logger.log.info(
        `[${request.requestId}][Middleware][checkSubjectNotExists] Metadata object with subject '${subject}' does not exist. Creating object`
      );
      return next();
    },

    checkSequenceNumbers: async (request: Request, response: Response, next: NextFunction) => {
      const { metadataObject } = request as CustomRequest;
      const metadataObjectProperties = Object.keys(metadataObject);

      logger.log.info(
        `[${request.requestId}][Middleware][checkSequenceNumbers] Checking that metadata object '${metadataObject.subject}' does not contain invalid sequence numbers`
      );

      const invalidEntry = Object.entries(request.body).find(([key, value]) => {
        if (!metadataObjectProperties.includes(key)) {
          return false;
        }
        const greaterSequenceNumber = Math.max(
          ...metadataObject[key].map((entrySnapshot) => entrySnapshot.sequenceNumber)
        );

        return (value as Entry).sequenceNumber !== greaterSequenceNumber + 1;
      });

      if (invalidEntry) {
        logger.log.info(
          `[${request.requestId}][Middleware][checkSequenceNumbers] Entry '${invalidEntry[0]}' contains an invalid sequence number`
        );

        return next(
          ErrorFactory.olderEntryError(
            `Entry ${invalidEntry[0]} contains an invalid sequence number. It should be one unit larger than the larger sequence number for the entry`
          )
        );
      }

      logger.log.info(
        `[${request.requestId}][Middleware][checkSequenceNumbers] Sequence number checked correctly`
      );
      return next();
    },
  };
};

export default configure;
