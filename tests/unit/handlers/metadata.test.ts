/* eslint-disable unicorn/no-useless-undefined */
import { configure } from '../../../src/server/handlers';
import { MetadataHandler } from '../../../src/server/handlers/metadata';
import { Logger } from '../../../src/server/logger/logger';
import { mockCustomRequest, mockRequest, mockResponse } from '../mocks/express';
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
  describe('Method createObject', () => {
    test('Check db insert service number of calls', async () => {
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

  describe('Method getObjectBySubject', () => {
    test('should return response status 200 when an existing object is retrieved', async () => {
      await metadataHandler.getObjectBySubject(
        mockCustomRequest(objectFromDatabase, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should retrieve the existing object with the highest sequenceNumber', async () => {
      await metadataHandler.getObjectBySubject(
        mockCustomRequest(objectFromDatabase, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith(objectFromResponse);
    });

    test('should throw an error if an invalid request.object is provided', async () => {
      await metadataHandler.getObjectBySubject(
        mockCustomRequest({ entry: 'must be an array' }, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(new TypeError('value.reduce is not a function'));
    });
  });

  describe('Method getPropertyNames', () => {
    test('should return response status 200 when properties of an existing object are retrieved', async () => {
      await metadataHandler.getPropertyNames(
        mockCustomRequest(objectFromDatabase, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should retrieve the property names of existing object', async () => {
      await metadataHandler.getPropertyNames(
        mockCustomRequest(objectFromDatabase, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith(['subject', 'entry']);
    });

    test('should return an empty array if an empty request.object is provided', async () => {
      await metadataHandler.getPropertyNames(
        mockCustomRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith([]);
    });
  });
});
