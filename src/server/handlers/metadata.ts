import { NextFunction, Request, Response } from 'express';

import { Entry, Metadata } from '../../types/metadata';
import { Logger } from '../logger/logger';
import metadataMappers from '../mappers/metadata';
import { CustomRequest } from '../middlewares/metadata';
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
  getPropertyNames(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<string[]> | void>;
  updateObject(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void>;
}

const configure = (logger: Logger, services: Services): MetadataHandler => ({
  createObject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void> => {
    try {
      logger.log.info('[Handlers][createObject] Creating metadata object');
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

  getObjectBySubject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<Metadata> | void> => {
    try {
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      return response
        .status(200)
        .send(metadataMappers.mapGetObjectBySubjectResponse(metadataObject));
    } catch (error) {
      logger.log.error('[Handler][getObjectBySubject] Error retrieving metadata object');
      return next(error);
    }
  },

  getPropertyNames: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<string[]> | void> => {
    try {
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      return response.status(200).send(Object.keys(metadataObject));
    } catch (error) {
      logger.log.error('[Handler][getPropertyNames] Error retrieving property names');
      return next(error);
    }
  },

  updateObject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void> => {
    try {
      logger.log.info('[Handlers][updateObject] Updating metadata object');
      const subject: string = request.params.subject;
      const { metadataObject } = request as CustomRequest;
      const metadataObjectProperties = Object.keys(metadataObject);
      const updates: {
        creations: Record<string, Entry[]>;
        editions: Record<string, Entry>;
      } = { creations: {}, editions: {} };
      for (const [key, value] of Object.entries(request.body)) {
        if (!metadataObjectProperties.includes(key)) {
          updates.creations[key] = [value as Entry];
        } else {
          updates.editions[key] = value as Entry;
        }
      }

      await services.databaseService.updateObject({ subject }, updates);
      logger.log.info('[Handlers][updateObject] Metada object updated');
      return response.sendStatus(204);
    } catch (error) {
      logger.log.error('[Handler][createObject] Error updating metadata object');
      return next(error);
    }
  },
});

export default configure;
