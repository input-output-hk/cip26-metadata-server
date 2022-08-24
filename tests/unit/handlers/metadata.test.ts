/* eslint-disable unicorn/no-useless-undefined */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
import { configure } from '../../../src/server/handlers';
import { MetadataHandler } from '../../../src/server/handlers/metadata';
import { Logger } from '../../../src/server/logger/logger';
import { mockRequest, mockResponse } from '../mocks/express';
import {
  mappedObject,
  objectFromDatabase,
  objectFromResponse,
  objectWithSubject,
  unmappedObject,
} from '../utils/data';

let metadataHandler: MetadataHandler;
const services = {
  databaseService: {
    getObject: jest.fn(),
    insertObject: jest.fn(),
    ensureExists: jest.fn(),
  },
};

beforeAll(() => {
  const logger = new Logger('info');
  metadataHandler = configure(logger, services).metadataHandler;
});

let next;
beforeEach(() => {
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Metadata handlers', () => {
  describe('createObject', () => {
    test('Object already exists', async () => {
      services.databaseService.ensureExists.mockImplementation(() => {
        throw ErrorFactory.subjectExistsError('A metadata object with that subject already exists');
      });
      await metadataHandler.createObject(mockRequest(unmappedObject), mockResponse, next);
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectExistsError('A metadata object with that subject already exists')
      );
    });

    describe('Object created succesfully', () => {
      test('Check db insert service number of calls', async () => {
        services.databaseService.ensureExists.mockImplementation(() => {
          return;
        });
        await metadataHandler.createObject(mockRequest(unmappedObject), mockResponse, next);
        expect(services.databaseService.insertObject).toHaveBeenCalledTimes(1);
      });

      test('Check db insert service call', async () => {
        await metadataHandler.createObject(mockRequest(objectWithSubject), mockResponse, next);
        expect(services.databaseService.insertObject).toHaveBeenCalledWith(objectWithSubject);
      });

      test('Check values are mapped correctly', async () => {
        await metadataHandler.createObject(mockRequest(unmappedObject), mockResponse, next);
        expect(services.databaseService.insertObject).toHaveBeenCalledWith(mappedObject);
      });

      test('Check response status', async () => {
        await metadataHandler.createObject(mockRequest(unmappedObject), mockResponse, next);
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(201);
      });
    });
  });

  describe('Method getObjectBySubject', () => {
    test('should return response status 200 when an existing object is retrieved', async () => {
      services.databaseService.ensureExists.mockResolvedValueOnce(objectFromDatabase);
      await metadataHandler.getObjectBySubject(
        mockRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should retrieve the existing object with the highest sequenceNumber', async () => {
      services.databaseService.ensureExists.mockResolvedValueOnce(objectFromDatabase);
      await metadataHandler.getObjectBySubject(
        mockRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith(objectFromResponse);
    });

    test('should call db.getObject() one time only', async () => {
      services.databaseService.ensureExists.mockResolvedValueOnce(objectFromDatabase);
      await metadataHandler.getObjectBySubject(
        mockRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(services.databaseService.ensureExists).toHaveBeenCalledTimes(1);
    });

    test('should call db.getObject() with an object as parameter that contains required property subject', async () => {
      services.databaseService.ensureExists.mockResolvedValueOnce(objectFromDatabase);
      await metadataHandler.getObjectBySubject(
        mockRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(services.databaseService.ensureExists).toHaveBeenCalledWith(
        { subject: objectFromDatabase.subject },
        true
      );
    });
  });
});
