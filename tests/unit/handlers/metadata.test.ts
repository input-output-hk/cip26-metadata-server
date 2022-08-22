/* eslint-disable unicorn/no-useless-undefined */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
import { configure } from '../../../src/server/handlers';
import { MetadataHandler } from '../../../src/server/handlers/metadata';
import { Logger } from '../../../src/server/logger/logger';
import { mockedRequest, mockedResponse, mockResponse } from '../mocks/express';

let metadataHandler: MetadataHandler;
const services = {
  databaseService: {
    getObject: jest.fn(),
    insertObject: jest.fn(),
  },
};
const metadata = { subject: 'some-subject' };
const object2 = {
  _id: 'abc',
  subject: 'subject object #2',
  entry: {
    value: 'value object #2',
    sequenceNumber: 2,
    signatures: {
      signature: '79a4601',
      publicKey: 'bc77d04',
    },
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
      services.databaseService.getObject.mockResolvedValueOnce({ _id: 'abc' });
      await metadataHandler.createObject(mockedRequest(metadata), mockedResponse(), next);
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectExistsError('A metadata object with that subject already exists')
      );
    });

    describe('Object created succesfully', () => {
      test('Check db insert service number of calls', async () => {
        services.databaseService.getObject.mockResolvedValueOnce(undefined);
        await metadataHandler.createObject(mockedRequest(metadata), mockedResponse(), next);
        expect(services.databaseService.insertObject).toHaveBeenCalledTimes(1);
      });

      test('Check db insert service call', async () => {
        services.databaseService.getObject.mockResolvedValueOnce(undefined);
        await metadataHandler.createObject(mockedRequest(metadata), mockedResponse(), next);
        expect(services.databaseService.insertObject).toHaveBeenCalledWith(metadata);
      });

      test('Check values are mapped correctly', async () => {
        services.databaseService.getObject.mockResolvedValueOnce(undefined);
        const metadataWithEntry = {
          subject: 'subject',
          entry: {
            value: true,
            sequenceNumber: 2,
            signatures: [],
          },
        };
        await metadataHandler.createObject(
          mockedRequest(metadataWithEntry),
          mockedResponse(),
          next
        );
        expect(services.databaseService.insertObject).toHaveBeenCalledWith({
          subject: 'subject',
          entry: [
            {
              value: true,
              sequenceNumber: 2,
              signatures: [],
            },
          ],
        });
      });

      test('Check response status', async () => {
        services.databaseService.getObject.mockResolvedValueOnce(undefined);
        const response = mockedResponse();
        await metadataHandler.createObject(mockedRequest(metadata), response, next);
        expect(response.sendStatus).toHaveBeenCalledWith(201);
      });
    });
  });

  describe('Method getObjectBySubject', () => {
    test('should return response status 200 when an existing object is retrieved', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(object2);
      await metadataHandler.getObjectBySubject(
        mockedRequest(undefined, { subject: object2.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('should retrieve the existing object', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(object2);
      await metadataHandler.getObjectBySubject(
        mockedRequest(undefined, { subject: object2.subject }),
        mockResponse,
        next
      );
      expect(mockResponse.send).toHaveBeenCalledWith(object2);
    });

    test('should call db.getObject() one time only', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(object2);
      await metadataHandler.getObjectBySubject(
        mockedRequest(undefined, { subject: object2.subject }),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledTimes(1);
    });

    test('should call db.getObject() with an object as parameter that contains required property subject', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(object2);
      await metadataHandler.getObjectBySubject(
        mockedRequest(undefined, { subject: object2.subject }),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledWith({ subject: object2.subject });
    });
  });
});
