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
  ): Promise<Response<object> | void>;
  queryObjects(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<object[]> | void>;
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
      logger.log.info('[Handlers][getObjectBySubject] Retrieving metadata object');
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      logger.log.info('[Handlers][getObjectBySubject] Metada object retrieved');
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
      logger.log.info('[Handlers][getPropertyNames] Retrieving property names');
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      logger.log.info('[Handlers][getPropertyNames] Property names retrieved');
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
  ): Promise<Response<object> | void> => {
    try {
      logger.log.info('[Handlers][getProperty] Retrieving property');
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
      logger.log.info('[Handlers][getProperty] Property retrieved');
      return response.status(200).send({ [propertyName]: mappedObject[propertyName] });
    } catch (error) {
      logger.log.error('[Handler][getProperty] Error retrieving property');
      return next(error);
    }
  },

  queryObjects: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<object[]> | void> => {
    try {
      logger.log.info('[Handlers][queryObjects] Querying metadata objects');
      const { subjects, properties } = request.body;
      const metadataObjects = await services.databaseService.queryObjects(subjects, properties);
      logger.log.info('[Handlers][queryObjects] Query results retrieved');
      const mappedObjects = metadataObjects?.map((metadataObject) => {
        delete metadataObject._id;
        return metadataMappers.mapGetObjectBySubjectResponse(metadataObject);
      });
      return response.status(200).send(mappedObjects);
    } catch (error) {
      logger.log.error('[Handler][queryObjects] Error querying metadata objects');
      return next(error);
    }
  },
});

export default configure;
