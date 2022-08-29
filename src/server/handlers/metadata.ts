import { NextFunction, Request, Response } from 'express';

import { Metadata } from '../../types/metadata';
import { ErrorFactory } from '../errors/error-factory';
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
  getProperty(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<string[]> | void>;
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

  getProperty: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<string[]> | void> => {
    try {
      const propertyName = request.params.propertyName;
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      if (!(propertyName in metadataObject)) {
        logger.log.error(
          `[Handlers][getProperty] Metadata object with subject '${metadataObject.subject}' does not contains property '${propertyName}'`
        );
        throw ErrorFactory.propertyNotFoundError(`Property '${propertyName}' does not exists`);
      }
      const mappedObject = metadataMappers.mapGetObjectBySubjectResponse(metadataObject);
      return response.status(200).send({ [propertyName]: mappedObject[propertyName] });
    } catch (error) {
      logger.log.error('[Handler][getProperty] Error retrieving property');
      return next(error);
    }
  },
});

export default configure;
