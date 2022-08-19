/* eslint-disable unicorn/no-useless-undefined */
import { ErrorFactory } from '../../../src/server/errors/error-factory';
import { configure } from '../../../src/server/handlers';
import { MetadataHandler } from '../../../src/server/handlers/metadata';
import { Logger } from '../../../src/server/logger/logger';
import { mockedRequest, mockedResponse } from '../mocks/express';

describe('Metadata handlers', () => {
  let metadataHandler: MetadataHandler;
  const services = {
    databaseService: {
      getObject: jest.fn(),
      insertObject: jest.fn(),
    },
  };
  const metadata = { subject: 'some-subject' };
  const next = jest.fn();

  beforeAll(() => {
    const logger = new Logger('info');
    metadataHandler = configure(logger, services).metadataHandler;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
});
