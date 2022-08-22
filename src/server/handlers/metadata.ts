import { NextFunction, Request, Response } from 'express';

import { Metadata } from '../../types/metadata';
import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import metadataMappers from '../mappers/metadata';
import { Services } from '../services';

export interface MetadataHandler {
  createObject(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void>;
  getObjectBySubject(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<Metadata> | void>;
}

const configure = (logger: Logger, services: Services): MetadataHandler => ({
  createObject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void> => {
    try {
      const subject = request.body.subject;
      logger.log.info('[Handlers][createObject] Creating or modifying metadata object');
      logger.log.info(`[Handlers][createObject] Getting metadata object with subject ${subject}`);
      const object = await services.databaseService.getObject({ subject });
      if (object) {
        logger.log.error(
          `[Handlers][createObject] Metadata object with subject ${subject} already exists`
        );
        throw ErrorFactory.subjectExistsError('A metadata object with that subject already exists');
      }
      logger.log.info(
        `[Handlers][createObject] Metadata object with subject ${subject} does not exist. Creating object`
      );
      await services.databaseService.insertObject(
        metadataMappers.mapMetadataProperties(request.body)
      );
      logger.log.info('[Handlers][createObject] Metada object created');

      return response.sendStatus(201);
    } catch (error) {
      logger.log.error('[Handler][createObject] Error creating metadata object');
      return next(error);
    }
  },

  getObjectBySubject: async (request, response, next): Promise<Response<Metadata> | void> => {
    const subject = request.params['subject'];
    try {
      const object = await services.databaseService.getObject({ subject });
      if (!object) {
        logger.log.error(
          `[Handlers][getObjectBySubject] Metadata object with subject ${subject} does not exists`
        );
        throw ErrorFactory.subjectNotFoundError(
          'A metadata object with that subject does not exists'
        );
      }
      delete object._id;
      return response.status(200).send(metadataMappers.mapGetObjectBySubjectResponse(object));
    } catch (error) {
      logger.log.error('[Handler][getObjectBySubject] Error retrieving metadata object');
      return next(error);
    }
  },
});

export default configure;
