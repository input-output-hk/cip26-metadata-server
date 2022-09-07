/* eslint-disable sonarjs/no-duplicate-string */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
import { Logger } from '../../../src/server/logger/logger';
import { buildMiddlewares } from '../../../src/server/middlewares';
import { SignaturesMiddleware } from '../../../src/server/middlewares/signatures';
import { mockRequest, mockResponse } from '../mocks/express';

let signaturesMiddleware: SignaturesMiddleware;
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
  signaturesMiddleware = buildMiddlewares(logger, services).signaturesMiddleware;
});

let next;
beforeEach(() => {
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Signatures middlewares', () => {
  describe('Method validateSignatures', () => {
    test('Should pass if there are no entries', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({ subject: 'test' }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith();
    });
    test('Should throw error if there are no signatures for entry', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({ subject: 'test', entry: { value: 1, sequenceNumber: 2, signatures: [] } }),
        mockResponse,
        next
      );

      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });
    test('Should throw error if signatures field is undefined for entry', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({ subject: 'test', entry: { value: 1, sequenceNumber: 2 } }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });

    test('Should throw error if there are no valid signatures (missing signature and malformed publicKey)', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'test',
          entry: {
            value: 1,
            sequenceNumber: 2,
            signatures: [
              {
                publicKey: 'invalid',
              },
            ],
          },
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });

    test('Should throw error if there are no valid signatures (missing publicKey and malformed signature)', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'test',
          entry: {
            value: 1,
            sequenceNumber: 2,
            signatures: [
              {
                signature: 'invalid',
              },
            ],
          },
        }),
        mockResponse,
        next
      );
    });

    test('Should throw error if there are no valid signatures (missing publicKey and signature)', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'test',
          entry: {
            value: 1,
            sequenceNumber: 2,
            signatures: [{}],
          },
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });

    test('Should throw error if there are no valid signatures (missing publicKey and signature signature)', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'test',
          entry: {
            value: 1,
            sequenceNumber: 2,
            signatures: [{}],
          },
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });

    test('Should throw error if there are no valid signatures (malformed publicKey and signature)', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'test',
          entry: {
            value: 1,
            sequenceNumber: 2,
            signatures: [
              {
                publicKey: 'invalid',
                signature: 'invalid',
              },
            ],
          },
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith(
        ErrorFactory.subjectNotFoundError('Entry entry does not contain a valid signature')
      );
    });

    test('Should tpass if there is one valid signature', async () => {
      await signaturesMiddleware.validateSignatures(
        mockRequest({
          subject: 'valid',
          entry_property1: {
            value: 'valid 1',
            sequenceNumber: 1,
            signatures: [
              {
                publicKey: 'invalid',
                signature: 'invalid',
              },
              {
                signature:
                  '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba000',
                publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
              },
            ],
          },
        }),
        mockResponse,
        next
      );
      expect(next).toHaveBeenCalledWith();
    });
  });
});
