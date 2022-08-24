import { NextFunction, Request, Response } from 'express';

import { Metadata } from '../../types/metadata';
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
      await services.databaseService.ensureExists({ subject }, false);
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
    const subject = request.params.subject;
    try {
      const object = await services.databaseService.ensureExists({ subject }, true);
      if (!object) {
        return;
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
