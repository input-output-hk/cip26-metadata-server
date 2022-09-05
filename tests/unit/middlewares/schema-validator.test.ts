/* eslint-disable sonarjs/no-duplicate-string */
import { Logger } from '../../../src/server/logger/logger';
import { buildMiddlewares, Middlewares } from '../../../src/server/middlewares';
import { mockRequest, mockResponse } from '../mocks/express';

let schemaValidator;
beforeAll(async () => {
  const logger = new Logger('info');
  const services = {
    databaseService: {
      getObject: jest.fn(),
      insertObject: jest.fn(),
      queryObjects: jest.fn(),
      updateObject: jest.fn(),
    },
  };
  const middlewares: Middlewares = buildMiddlewares(logger, services);
  schemaValidator = middlewares.schemaValidatorMiddleware;
});

let next;
beforeEach(() => {
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Schema validator middlewares', () => {
  describe('Method validateSchema', () => {
    describe('Validate metadata object', () => {
      test('should validate that metadata object contains required property "subject" when an empty body is provided', async () => {
        await schemaValidator.validateSchema(mockRequest(), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '',
            schemaPath: '#/required',
            keyword: 'required',
            params: {
              missingProperty: 'subject',
            },
            message: "must have required property 'subject'",
          },
        ]);
      });

      test('should validate that metadata object contains required property "subject" and any additional property must be an object', async () => {
        await schemaValidator.validateSchema(
          mockRequest({ no_subject: '', add_prop: '' }),
          mockResponse,
          next
        );
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '',
            schemaPath: '#/required',
            keyword: 'required',
            params: {
              missingProperty: 'subject',
            },
            message: "must have required property 'subject'",
          },
          {
            instancePath: '/no_subject',
            schemaPath: '#/type',
            keyword: 'type',
            params: {
              type: 'object',
            },
            message: 'must be object',
          },
          {
            instancePath: '/add_prop',
            schemaPath: '#/type',
            keyword: 'type',
            params: {
              type: 'object',
            },
            message: 'must be object',
          },
        ]);
      });

      test('should validate that subject cannot be empty and that each entry must have required properties: value, sequenceNumber, signatures', async () => {
        await schemaValidator.validateSchema(
          mockRequest({ subject: '', add_prop: {} }),
          mockResponse,
          next
        );
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/add_prop',
            schemaPath: '#/required',
            keyword: 'required',
            params: {
              missingProperty: 'value',
            },
            message: "must have required property 'value'",
          },
          {
            instancePath: '/add_prop',
            schemaPath: '#/required',
            keyword: 'required',
            params: {
              missingProperty: 'sequenceNumber',
            },
            message: "must have required property 'sequenceNumber'",
          },
          {
            instancePath: '/add_prop',
            schemaPath: '#/required',
            keyword: 'required',
            params: {
              missingProperty: 'signatures',
            },
            message: "must have required property 'signatures'",
          },
          {
            instancePath: '/subject',
            schemaPath: '#/properties/subject/minLength',
            keyword: 'minLength',
            params: {
              limit: 1,
            },
            message: 'must NOT have fewer than 1 characters',
          },
        ]);
      });

      test('should validate the well-formedness of subject and all the well known properties when present in a metadata object', async () => {
        const body = {
          subject: 1,
          policy: {},
          preimage: 1,
          name: {},
          description: [],
          ticker: 2,
          decimals: 'ONE',
          url: true,
          logo: 1,
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/subject',
            schemaPath: '#/properties/subject/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/policy',
            schemaPath: '#/properties/policy/contentEncoding',
          },
          {
            instancePath: '/policy',
            schemaPath: '#/properties/policy/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            instancePath: '/preimage',
            schemaPath: '#/properties/preimage/type',
            keyword: 'type',
            params: {
              type: 'object',
            },
            message: 'must be object',
          },
          {
            instancePath: '/name',
            schemaPath: '#/properties/name/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            instancePath: '/description',
            schemaPath: '#/properties/description/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            instancePath: '/ticker',
            schemaPath: '#/properties/ticker/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            instancePath: '/decimals',
            schemaPath: '#/properties/decimals/type',
            keyword: 'type',
            params: {
              type: 'integer',
            },
            message: 'must be integer',
          },
          {
            instancePath: '/url',
            schemaPath: '#/properties/url/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            keyword: 'contentEncoding',
            message: 'invalid base64-encoded data',
            instancePath: '/logo',
            schemaPath: '#/properties/logo/contentEncoding',
          },
          {
            instancePath: '/logo',
            schemaPath: '#/properties/logo/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
        ]);
      });

      test('should validate the well-formedness of an entry property', async () => {
        const body = {
          subject: 'sub',
          contact: {
            value: 123,
            sequenceNumber: 'integer',
            signatures: [],
            extra_property: 'invalid',
          },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/contact',
            schemaPath: '#/additionalProperties',
            keyword: 'additionalProperties',
            params: {
              additionalProperty: 'extra_property',
            },
            message: 'must NOT have additional properties',
          },
          {
            instancePath: '/contact/sequenceNumber',
            schemaPath: '#/definitions/sequenceNumber/type',
            keyword: 'type',
            params: {
              type: 'integer',
            },
            message: 'must be integer',
          },
          {
            instancePath: '/contact/signatures',
            schemaPath: '#/minItems',
            keyword: 'minItems',
            params: {
              limit: 1,
            },
            message: 'must NOT have fewer than 1 items',
          },
        ]);
      });

      test('should validate that negative sequenceNumber is invalid and that signature must have required properties: signature and publicKey', async () => {
        await schemaValidator.validateSchema(
          mockRequest({
            subject: 'sub',
            contact: { value: '123', sequenceNumber: -1, signatures: [{}] },
          }),
          mockResponse,
          next
        );
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/contact/sequenceNumber',
            schemaPath: '#/definitions/sequenceNumber/minimum',
            keyword: 'minimum',
            params: {
              comparison: '>=',
              limit: 0,
            },
            message: 'must be >= 0',
          },
          {
            instancePath: '/contact/signatures/0',
            schemaPath: '#/definitions/signature/required',
            keyword: 'required',
            params: {
              missingProperty: 'publicKey',
            },
            message: "must have required property 'publicKey'",
          },
          {
            instancePath: '/contact/signatures/0',
            schemaPath: '#/definitions/signature/required',
            keyword: 'required',
            params: {
              missingProperty: 'signature',
            },
            message: "must have required property 'signature'",
          },
        ]);
      });

      test('should validate that minimun length of signature is 128 and minimun length of publicKey is 64', async () => {
        const body = {
          subject: 'sub',
          entry_property: {
            value: {},
            sequenceNumber: 0,
            signatures: [{ signature: '79a4601', publicKey: 'bc77d04' }],
          },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/entry_property/signatures/0/publicKey',
            schemaPath: '#/definitions/signature/properties/publicKey/minLength',
            keyword: 'minLength',
            params: {
              limit: 64,
            },
            message: 'must NOT have fewer than 64 characters',
          },
          {
            instancePath: '/entry_property/signatures/0/signature',
            schemaPath: '#/definitions/signature/properties/signature/minLength',
            keyword: 'minLength',
            params: {
              limit: 128,
            },
            message: 'must NOT have fewer than 128 characters',
          },
        ]);
      });

      test('should validate that maximun length of signature is 128 and maximun length of publicKey is 64', async () => {
        const body = {
          subject:
            '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890_1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
          entry_property: {
            value: [],
            sequenceNumber: 10,
            signatures: [
              {
                signature:
                  '31323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333435363738393031323334a',
                publicKey: '3132333435363738393031323334353637383930313233343536373839303132a',
              },
            ],
          },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/entry_property/signatures/0/publicKey',
            schemaPath: '#/definitions/signature/properties/publicKey/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 64,
            },
            message: 'must NOT have more than 64 characters',
          },
          {
            instancePath: '/entry_property/signatures/0/signature',
            schemaPath: '#/definitions/signature/properties/signature/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 128,
            },
            message: 'must NOT have more than 128 characters',
          },
          {
            instancePath: '/subject',
            schemaPath: '#/properties/subject/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 255,
            },
            message: 'must NOT have more than 255 characters',
          },
        ]);
      });

      test('should validate that signature is encoded as base16 and publicKey is encoded as base16', async () => {
        const body = {
          subject: 'sub',
          entry_property: {
            value: [],
            sequenceNumber: 10,
            signatures: [
              {
                signature:
                  '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333x',
                publicKey: '123456789012345678901234567890123456789012345678901234567890123x',
              },
            ],
          },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/entry_property/signatures/0/publicKey',
            schemaPath: '#/definitions/signature/properties/publicKey/contentEncoding',
          },
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/entry_property/signatures/0/signature',
            schemaPath: '#/definitions/signature/properties/signature/contentEncoding',
          },
        ]);
      });
    });

    describe('Validate well known property: policy', () => {
      test('should validate that minimun length for policy is 56 chars', async () => {
        const body = {
          subject: 'valid subject',
          policy: '666F6F626172',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/policy',
            schemaPath: '#/properties/policy/minLength',
            keyword: 'minLength',
            params: {
              limit: 56,
            },
            message: 'must NOT have fewer than 56 characters',
          },
        ]);
      });

      test('should validate that maximun length for policy is 120 chars', async () => {
        const body = {
          subject: 'valid subject',
          policy:
            '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/policy',
            schemaPath: '#/properties/policy/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 120,
            },
            message: 'must NOT have more than 120 characters',
          },
        ]);
      });

      test('should validate that policy is encoded as base16', async () => {
        const body = {
          subject: 'valid subject',
          policy:
            'This string is NOT encoded, This string is NOT encoded, This string is NOT encoded',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/policy',
            schemaPath: '#/properties/policy/contentEncoding',
          },
        ]);
      });
    });

    describe('Validate well known property: preimage', () => {
      test('should validate that preimage contains required properties: alg, msg', async () => {
        const body = {
          subject: 'valid subject',
          preimage: {},
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/preimage',
            schemaPath: '#/properties/preimage/required',
            keyword: 'required',
            params: {
              missingProperty: 'alg',
            },
            message: "must have required property 'alg'",
          },
          {
            instancePath: '/preimage',
            schemaPath: '#/properties/preimage/required',
            keyword: 'required',
            params: {
              missingProperty: 'msg',
            },
            message: "must have required property 'msg'",
          },
        ]);
      });

      test('should validate that alg and msg are string', async () => {
        const body = {
          subject: 'the subject',
          preimage: { alg: 1, msg: 2 },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/preimage/alg',
            schemaPath: '#/properties/preimage/properties/alg/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
          {
            instancePath: '/preimage/alg',
            schemaPath: '#/properties/preimage/properties/alg/enum',
            keyword: 'enum',
            params: {
              allowedValues: ['sha1', 'sha', 'sha3', 'blake2b', 'blake2s', 'keccak', 'md5'],
            },
            message: 'must be equal to one of the allowed values',
          },
          {
            instancePath: '/preimage/msg',
            schemaPath: '#/properties/preimage/properties/msg/type',
            keyword: 'type',
            params: {
              type: 'string',
            },
            message: 'must be string',
          },
        ]);
      });

      test('should validate that msg is encoded as base16', async () => {
        const body = {
          subject: 'the subject',
          preimage: { alg: 'sha1', msg: 'this is not encoded as base16' },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/preimage/msg',
            schemaPath: '#/properties/preimage/properties/msg/contentEncoding',
          },
        ]);
      });
    });

    describe('Validate well known property: name', () => {
      test('should validate that minimun length of name is 1', async () => {
        const body = {
          subject: 'test',
          name: '',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/name',
            schemaPath: '#/properties/name/minLength',
            keyword: 'minLength',
            params: {
              limit: 1,
            },
            message: 'must NOT have fewer than 1 characters',
          },
        ]);
      });

      test('should validate that maximun length of name is 50', async () => {
        const body = {
          subject: 'test',
          name: '123456789012345678901234567890123456789012345678901',
          description: '',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 50,
            },
            message: 'must NOT have more than 50 characters',
          },
        ]);
      });
    });

    describe('Validate well known property: description', () => {
      test('should validate that maximun length of description is 500', async () => {
        const body = {
          subject: 'test',
          description:
            '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/description',
            schemaPath: '#/properties/description/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 500,
            },
            message: 'must NOT have more than 500 characters',
          },
        ]);
      });
    });

    describe('Validate well known property: ticker', () => {
      test('should validate that minimun length of ticker is 1', async () => {
        const body = {
          subject: 'ticker test',
          ticker: '1',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/ticker',
            schemaPath: '#/properties/ticker/minLength',
            keyword: 'minLength',
            params: {
              limit: 2,
            },
            message: 'must NOT have fewer than 2 characters',
          },
        ]);
      });

      test('should validate that maximun length of ticker is 9', async () => {
        const body = {
          subject: 'ticker test',
          ticker: '1234567890',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/ticker',
            schemaPath: '#/properties/ticker/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 9,
            },
            message: 'must NOT have more than 9 characters',
          },
        ]);
      });
    });

    describe('Validate well known property: decimals', () => {
      test('should validate that minimun number of decimals is 1', async () => {
        const body = {
          subject: 'decimals test',
          decimals: 0,
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/decimals',
            schemaPath: '#/properties/decimals/minimum',
            keyword: 'minimum',
            params: {
              comparison: '>=',
              limit: 1,
            },
            message: 'must be >= 1',
          },
        ]);
      });

      test('should validate that maximun number of decimals is 19', async () => {
        const body = {
          subject: 'decimals test',
          decimals: 20,
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/decimals',
            schemaPath: '#/properties/decimals/maximum',
            keyword: 'maximum',
            params: {
              comparison: '<=',
              limit: 19,
            },
            message: 'must be <= 19',
          },
        ]);
      });
    });

    describe('Validate well known property: url', () => {
      test('should validate that url is a valid uri', async () => {
        const body = {
          subject: 'url test',
          url: 'http;',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/url',
            schemaPath: '#/properties/url/format',
            keyword: 'format',
            params: {
              format: 'uri',
            },
            message: 'must match format "uri"',
          },
        ]);
      });

      test('should validate that maximun length of url is 250', async () => {
        const body = {
          subject: 'url test',
          url: 'http://1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890_1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/url',
            schemaPath: '#/properties/url/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 250,
            },
            message: 'must NOT have more than 250 characters',
          },
        ]);
      });
    });

    describe('Validate well known property: logo', () => {
      test('should validate that logo is encoded as base64', async () => {
        const body = {
          subject: 'the logo',
          logo: 'invalid',
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            keyword: 'contentEncoding',
            message: 'invalid base64-encoded data',
            instancePath: '/logo',
            schemaPath: '#/properties/logo/contentEncoding',
          },
        ]);
      });
    });

    describe('Validate complex metadata objects', () => {
      test('should validate a complex metadata object with 3 entries and find errors on different entries', async () => {
        const body = {
          subject: 'valid subject',
          name: 'valid name',
          description: 'valid description',
          ticker: 'A/B',
          decimals: 1,
          url: 'http://12345678901234567890123456789012345678901234567890/?query=yes',
          logo: 'aGVsbG8K',
          contact: {
            value: 1,
            sequenceNumber: 1,
            signatures: [
              {
                signature:
                  '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
                publicKey: '1234567890123456789012345678901234567890123456789012345678901234',
              },
            ],
          },
          'cbu-jpmorgan': {
            value: 'JPMorgan Chase & Co.',
            sequenceNumber: -1,
            signatures: [
              {
                signature:
                  '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
                publicKey: '1234567890123456789012345678901234567890123456789012345678901234',
              },
            ],
          },
          'cbu-america': {
            value: 'Bank of America Corp.',
            sequenceNumber: 1,
            signatures: [
              {
                signature:
                  'x2345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
                publicKey: 'x234567890123456789012345678901234567890123456789012345678901234',
              },
            ],
          },
        };
        await schemaValidator.validateSchema(mockRequest(body), mockResponse, next);
        expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
          {
            instancePath: '/cbu-jpmorgan/sequenceNumber',
            schemaPath: '#/definitions/sequenceNumber/minimum',
            keyword: 'minimum',
            params: {
              comparison: '>=',
              limit: 0,
            },
            message: 'must be >= 0',
          },
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/cbu-america/signatures/0/publicKey',
            schemaPath: '#/definitions/signature/properties/publicKey/contentEncoding',
          },
          {
            keyword: 'contentEncoding',
            message: 'invalid base16-encoded data',
            instancePath: '/cbu-america/signatures/0/signature',
            schemaPath: '#/definitions/signature/properties/signature/contentEncoding',
          },
        ]);
      });
    });
  });

  describe('Method validateBatchQueryRequestBody', () => {
    test('should validate that request body contains required property "subjects"', async () => {
      await schemaValidator.validateBatchQueryRequestBody(mockRequest({}), mockResponse, next);
      expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
        {
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: {
            missingProperty: 'subjects',
          },
          message: "must have required property 'subjects'",
        },
      ]);
    });

    test("should validate that both 'subjects' and 'properties' are arrays", async () => {
      await schemaValidator.validateBatchQueryRequestBody(
        mockRequest({ subjects: {}, properties: '' }),
        mockResponse,
        next
      );
      expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
        {
          instancePath: '/subjects',
          schemaPath: '#/properties/subjects/type',
          keyword: 'type',
          params: {
            type: 'array',
          },
          message: 'must be array',
        },
        {
          instancePath: '/properties',
          schemaPath: '#/properties/properties/type',
          keyword: 'type',
          params: {
            type: 'array',
          },
          message: 'must be array',
        },
      ]);
    });

    test("should validate that neither 'subjects' nor 'properties' are empty arrays", async () => {
      await schemaValidator.validateBatchQueryRequestBody(
        mockRequest({ subjects: [], properties: [] }),
        mockResponse,
        next
      );
      expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
        {
          instancePath: '/subjects',
          schemaPath: '#/properties/subjects/minItems',
          keyword: 'minItems',
          params: {
            limit: 1,
          },
          message: 'must NOT have fewer than 1 items',
        },
        {
          instancePath: '/properties',
          schemaPath: '#/properties/properties/minItems',
          keyword: 'minItems',
          params: {
            limit: 1,
          },
          message: 'must NOT have fewer than 1 items',
        },
      ]);
    });

    test("should validate that both 'subjects' and 'properties' are lists of strings", async () => {
      await schemaValidator.validateBatchQueryRequestBody(
        mockRequest({ subjects: ['a', 'b', '', 1], properties: [true] }),
        mockResponse,
        next
      );
      expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
        {
          instancePath: '/subjects/3',
          schemaPath: '#/properties/subjects/items/type',
          keyword: 'type',
          params: {
            type: 'string',
          },
          message: 'must be string',
        },
        {
          instancePath: '/properties/0',
          schemaPath: '#/properties/properties/items/type',
          keyword: 'type',
          params: {
            type: 'string',
          },
          message: 'must be string',
        },
      ]);
    });

    test('should validate that request body does not contain additional properties', async () => {
      await schemaValidator.validateBatchQueryRequestBody(
        mockRequest({ extra_property: ['a', 'b'], properties: [''] }),
        mockResponse,
        next
      );
      expect(next.mock.calls[0][0].validationErrors).toStrictEqual([
        {
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: {
            missingProperty: 'subjects',
          },
          message: "must have required property 'subjects'",
        },
        {
          instancePath: '',
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: {
            additionalProperty: 'extra_property',
          },
          message: 'must NOT have additional properties',
        },
      ]);
    });
  });
});
