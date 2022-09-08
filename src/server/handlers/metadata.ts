import { NextFunction, Response } from 'express';
import { Request } from 'request-id/express';

import { Entry, Metadata } from '../../types/metadata';
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
  updateObject(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void>;
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
    const { subject } = request.body;
    try {
      logger.log.info(
        `[Handlers][createObject][${request.requestId}] Creating metadata object with subject '${subject}'`
      );
      await services.databaseService.insertObject(
        metadataMappers.mapMetadataProperties(request.body)
      );
      logger.log.info(
        `[Handlers][createObject][${request.requestId}] Metadata object '${subject}' was successfully created`
      );
      return response.sendStatus(201);
    } catch (error) {
      logger.log.error(
        `[Handler][createObject][${request.requestId}] Error creating metadata object with subject '${subject}'`
      );
      return next(error);
    }
  },

  getObjectBySubject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<Metadata> | void> => {
    const { subject } = request.params;
    try {
      logger.log.info(
        `[Handlers][getObjectBySubject][${request.requestId}] Retrieving metadata object with subject '${subject}'`
      );
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      logger.log.info(
        `[Handlers][getObjectBySubject][${request.requestId}] Metadata object '${subject}' was successfully retrieved`
      );
      return response
        .status(200)
        .send(metadataMappers.mapGetObjectBySubjectResponse(metadataObject));
    } catch (error) {
      logger.log.error(
        `[Handler][getObjectBySubject][${request.requestId}] Error retrieving metadata object with subject '${subject}'`
      );
      return next(error);
    }
  },

  getPropertyNames: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<string[]> | void> => {
    const { subject } = request.params;
    try {
      logger.log.info(
        `[Handlers][getPropertyNames][${request.requestId}] Retrieving property names for '${subject}'`
      );
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      logger.log.info(
        `[Handlers][getPropertyNames][${request.requestId}] Property names for '${subject}' were successfully retrieved`
      );
      return response.status(200).send(Object.keys(metadataObject));
    } catch (error) {
      logger.log.error(
        `[Handler][getPropertyNames][${request.requestId}] Error retrieving property names for '${subject}'`
      );
      return next(error);
    }
  },

  getProperty: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<object> | void> => {
    const { subject } = request.params;
    try {
      logger.log.info(
        `[Handlers][getProperty][${request.requestId}] Retrieving property for '${subject}'`
      );
      const propertyName = request.params.propertyName;
      const { metadataObject } = request as CustomRequest;
      delete metadataObject._id;
      if (!(propertyName in metadataObject)) {
        logger.log.error(
          `[Handlers][getProperty][${request.requestId}] Metadata object with subject '${subject}' does not contains property '${propertyName}'`
        );
        throw ErrorFactory.propertyNotFoundError(
          `Property '${propertyName}' does not exists in metadata object with subject '${subject}'`
        );
      }
      const mappedObject = metadataMappers.mapGetObjectBySubjectResponse(metadataObject);
      logger.log.info(
        `[Handlers][getProperty][${request.requestId}] Property '${propertyName}' was successfully retrieved`
      );
      return response.status(200).send({ [propertyName]: mappedObject[propertyName] });
    } catch (error) {
      logger.log.error(
        `[Handler][getProperty][${request.requestId}] Error retrieving property for '${subject}'`
      );
      return next(error);
    }
  },

  queryObjects: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<object[]> | void> => {
    try {
      logger.log.info(`[Handlers][queryObjects][${request.requestId}] Querying metadata objects`);
      const { subjects, properties } = request.body;
      const metadataObjects = await services.databaseService.queryObjects(subjects, properties);
      logger.log.info(`[Handlers][queryObjects][${request.requestId}] Query results retrieved`);
      const mappedObjects = metadataObjects?.map((metadataObject) => {
        delete metadataObject._id;
        return metadataMappers.mapGetObjectBySubjectResponse(metadataObject);
      });
      return response.status(200).send(mappedObjects);
    } catch (error) {
      logger.log.error(
        `[Handler][queryObjects][${request.requestId}] Error querying metadata objects`
      );
      return next(error);
    }
  },

  updateObject: async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<{ statusCode: number } | void> => {
    const subject: string = request.params.subject;
    try {
      logger.log.info(
        `[Handlers][updateObject][${request.requestId}] Updating metadata object with subject '${subject}'`
      );
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
      logger.log.info(
        `[Handlers][updateObject][${request.requestId}] Metadata object '${subject}' was successfully updated`
      );
      return response.sendStatus(204);
    } catch (error) {
      logger.log.error(
        `[Handler][createObject][${request.requestId}] Error updating metadata object with subject '${subject}'`
      );
      return next(error);
    }
  },
});

export default configure;
