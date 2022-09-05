/* eslint-disable unicorn/no-useless-undefined */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
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
    queryObjects: jest.fn(),
    updateObject: jest.fn(),
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

  describe('Method getProperty', () => {
    test('should return response status 200 when the given property of an existing object is retrieved', async () => {
      await metadataHandler.getProperty(
        mockCustomRequest(objectFromDatabase, {
          subject: objectFromDatabase.subject,
          propertyName: 'subject',
        }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test("should retrieve the value of the given property 'subject' if that property does exist in a metadata object", async () => {
      await metadataHandler.getProperty(
        mockCustomRequest(objectFromDatabase, {
          subject: objectFromDatabase.subject,
          propertyName: 'subject',
        }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith({ subject: 'subject object #2' });
    });

    test("should retrieve the value of the given property 'entry1' with the highest sequenceNumber", async () => {
      await metadataHandler.getProperty(
        mockCustomRequest(objectFromDatabase, {
          subject: objectFromDatabase.subject,
          propertyName: 'entry',
        }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith({
        entry: {
          value: 'value object #2, version 2 ',
          sequenceNumber: 2,
          signatures: [
            {
              signature: '79a4601',
              publicKey: 'bc77d04',
            },
          ],
        },
      });
    });

    test("should throw an error if the given property 'unexisting' does not exists in the metadata object", async () => {
      await metadataHandler.getProperty(
        mockCustomRequest(objectFromDatabase, {
          subject: objectFromDatabase.subject,
          propertyName: 'unexisting',
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.propertyNotFoundError("Property 'unexisting' does not exists")
      );
    });
  });

  describe('Method queryObjects', () => {
    test('should return response status 200 even when no subjects were found', async () => {
      services.databaseService.queryObjects.mockResolvedValueOnce([]);
      await metadataHandler.queryObjects(mockRequest({ subjects: ['abc'] }), mockResponse, next);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should return response status 200 when query results were retrieved', async () => {
      services.databaseService.queryObjects.mockResolvedValueOnce([
        { _id: '1', name: 'one' },
        { _id: '2', name: 'two' },
      ]);
      await metadataHandler.queryObjects(
        mockRequest({ subjects: ['abc'], properties: ['name'] }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test("should return a list of metadata objects with their properties narrowed down to only those specified by 'properties'", async () => {
      services.databaseService.queryObjects.mockResolvedValueOnce([
        { _id: '1', name: 'one' },
        { _id: '2', name: 'two' },
      ]);
      await metadataHandler.queryObjects(
        mockRequest({ subjects: ['sub1', 'sub2'], properties: ['name'] }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith([{ name: 'one' }, { name: 'two' }]);
    });

    test("should retrieve a metadata object with all their properties including the entry property 'entry' with the highest sequenceNumber", async () => {
      services.databaseService.queryObjects.mockResolvedValueOnce([{ ...objectFromDatabase }]);
      await metadataHandler.queryObjects(
        mockRequest({ subjects: ['subject object #2'] }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith([{ ...objectFromResponse }]);
    });

    test('should call db.queryObjects() one time only', async () => {
      await metadataHandler.queryObjects(mockRequest({ subjects: ['abc'] }), mockResponse, next);
      expect(services.databaseService.queryObjects).toHaveBeenCalledTimes(1);
    });

    test('should call db.queryObjects() with two parameters: an array of subjects and an array of properties', async () => {
      await metadataHandler.queryObjects(
        mockRequest({ subjects: ['abc'], properties: ['def'] }),
        mockResponse,
        next
      );
      expect(services.databaseService.queryObjects).toHaveBeenCalledWith(['abc'], ['def']);
    });

    test('should allow to call db.queryObjects() with only an array of subjects as parameters and an undefined value for properties', async () => {
      await metadataHandler.queryObjects(mockRequest({ subjects: ['abc'] }), mockResponse, next);
      expect(services.databaseService.queryObjects).toHaveBeenCalledWith(['abc'], undefined);
    });
  });
});
