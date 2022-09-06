/* eslint-disable unicorn/no-useless-undefined */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
import { Logger } from '../../../src/server/logger/logger';
import { buildMiddlewares } from '../../../src/server/middlewares';
import { MetadataMiddleware } from '../../../src/server/middlewares/metadata';
import { mockCustomRequest, mockRequest, mockResponse } from '../mocks/express';
import { objectFromDatabase } from '../utils/data';

let metadataMiddleware: MetadataMiddleware;
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
  metadataMiddleware = buildMiddlewares(logger, services).metadataMiddleware;
});

let next;
beforeEach(() => {
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Metadata middlewares', () => {
  describe('Method checkSubjectExists', () => {
    test('should throw an error if an unexisting subject is provided', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(undefined);
      await metadataMiddleware.checkSubjectExists(
        mockRequest(undefined, { subject: 'unexisting' }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError(
          "A metadata object with subject 'unexisting' does not exists"
        )
      );
    });

    test('should call db.getObject() one time only', async () => {
      services.databaseService.getObject.mockResolvedValueOnce({ _id: 'abc' });
      await metadataMiddleware.checkSubjectExists(
        mockRequest(undefined, { subject: 'existing' }),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledTimes(1);
    });

    test('should call db.getObject() with an object as parameter that contains required property subject', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(objectFromDatabase);
      await metadataMiddleware.checkSubjectExists(
        mockRequest(undefined, { subject: objectFromDatabase.subject }),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledWith({
        subject: objectFromDatabase.subject,
      });
    });

    test('should call next() without parameters if an existing subject is provided', async () => {
      services.databaseService.getObject.mockResolvedValueOnce({ _id: 'abc' });
      await metadataMiddleware.checkSubjectExists(
        mockRequest(undefined, { subject: 'existing' }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Method checkSubjectNotExists', () => {
    test('should throw an error if an existing subject is provided', async () => {
      services.databaseService.getObject.mockResolvedValueOnce({ _id: 'abc' });
      await metadataMiddleware.checkSubjectNotExists(
        mockRequest(objectFromDatabase),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectExistsError('A metadata object with that subject already exists')
      );
    });

    test('should call db.getObject() one time only', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(undefined);
      await metadataMiddleware.checkSubjectNotExists(
        mockRequest(objectFromDatabase),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledTimes(1);
    });

    test('should call db.getObject() with an object as parameter that contains required property subject', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(undefined);
      await metadataMiddleware.checkSubjectNotExists(
        mockRequest(objectFromDatabase),
        mockResponse,
        next
      );
      expect(services.databaseService.getObject).toHaveBeenCalledWith({
        subject: objectFromDatabase.subject,
      });
    });

    test('should call next() without parameters if an unexisting subject is provided', async () => {
      services.databaseService.getObject.mockResolvedValueOnce(undefined);
      await metadataMiddleware.checkSubjectNotExists(
        mockRequest(objectFromDatabase),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Method checkSequenceNumbers', () => {
    test('Should fail if a sequence number is higher from oldest + 1', async () => {
      await metadataMiddleware.checkSequenceNumbers(
        mockCustomRequest(
          {
            subject: 'abc',
            entry: [
              {
                sequenceNumber: 2,
                value: 1,
                signatures: [],
              },
            ],
          },
          { subject: 'abc' },
          {
            entry: {
              sequenceNumber: 4,
              value: 1,
              signatures: [],
            },
          }
        ),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError(
          'Entry entry contains an invalid sequence number. It should be one unit larger than the larger sequence number for the entry'
        )
      );
    });

    test('Should fail if a sequence number is lower from oldest + 1', async () => {
      await metadataMiddleware.checkSequenceNumbers(
        mockCustomRequest(
          {
            subject: 'abc',
            entry: [
              {
                sequenceNumber: 4,
                value: 1,
                signatures: [],
              },
            ],
          },
          { subject: 'abc' },
          {
            entry: {
              sequenceNumber: 1,
              value: 1,
              signatures: [],
            },
          }
        ),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError(
          'Entry entry contains an invalid sequence number. It should be one unit larger than the larger sequence number for the entry'
        )
      );
    });

    test('Should check sequence number correctly', async () => {
      await metadataMiddleware.checkSequenceNumbers(
        mockCustomRequest(
          {
            subject: 'abc',
            entry: [
              {
                sequenceNumber: 2,
                value: 1,
                signatures: [],
              },
              {
                sequenceNumber: 3,
                value: 1,
                signatures: [],
              },
            ],
          },
          { subject: 'abc' },
          {
            entry: {
              sequenceNumber: 4,
              value: 1,
              signatures: [],
            },
          }
        ),
        mockResponse,
        next
      );
      expect(next.mock.calls[0][0]).not.toBeDefined();
    });
  });
});
