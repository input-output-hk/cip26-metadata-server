import { Express } from 'express';
import { Db } from 'mongodb';
import { Server } from 'node:http';
import request from 'supertest';

import Environment from '../../src/server/config/environment';
import { connectToDatabase } from '../../src/server/db';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import { buildMiddlewares, Middlewares } from '../../src/server/middlewares';
import buildServer from '../../src/server/server';
import { configure as configureServices, Services } from '../../src/server/services';

let connection: Server, database: Db, environment: Environment, server: Express, services: Services;

beforeAll(async () => {
  environment = new Environment();
  environment.dbUri = process.env.MONGO_URL;
  const logger = new Logger(environment.loggerLevel);
  database = await connectToDatabase(environment, logger);
  services = configureServices(logger, database);
  const handlers: Handlers = configure(logger, services);
  const middlewares: Middlewares = buildMiddlewares(logger);
  server = buildServer(handlers, middlewares, environment, logger);
  connection = server.listen(environment.port);
});

describe('POST /metadata', () => {
  test('should not allow to create an invalid metadata object', async () => {
    const response = await request(environment.connectionString)
      .post('/metadata')
      .send({
        subject: 'sub',
        contact: {
          value: 123,
          sequenceNumber: 1,
          signatures: {
            signature: '79a4601',
            publicKey: 'bc77d04',
          },
          extra_property: 'invalid',
        },
      });
    expect(response.body).toStrictEqual([
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
        instancePath: '/contact/signatures/publicKey',
        schemaPath: '#/definitions/signatures/properties/publicKey/minLength',
        keyword: 'minLength',
        params: {
          limit: 64,
        },
        message: 'must NOT have fewer than 64 characters',
      },
      {
        instancePath: '/contact/signatures/signature',
        schemaPath: '#/definitions/signatures/properties/signature/minLength',
        keyword: 'minLength',
        params: {
          limit: 128,
        },
        message: 'must NOT have fewer than 128 characters',
      },
    ]);
  });

  test('should create a valid subject with an entry', async () => {
    const response = await request(environment.connectionString)
      .post('/metadata')
      .send({
        subject: 'sub',
        entry1: {
          value: 123,
          sequenceNumber: 1,
          signatures: {
            signature:
              '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333a',
            publicKey: '123456789012345678901234567890123456789012345678901234567890123a',
          },
        },
      });
    expect(response.text).toEqual('Created');
  });

  test('should not allow to create an object with duplicate subject', async () => {
    const response = await request(environment.connectionString)
      .post('/metadata')
      .send({
        subject: 'sub',
        entry1: {
          value: 123,
          sequenceNumber: 1,
          signatures: {
            signature:
              '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333a',
            publicKey: '123456789012345678901234567890123456789012345678901234567890123a',
          },
        },
      });
    expect(response.text).toStrictEqual(
      '{"internalCode":"subjectExistsError","message":"A metadata object with that subject already exists"}'
    );
  });
});

describe('GET /metadata/:subject', () => {
  test("should retrieve an existing metadata object with subject: 'test4'", async () => {
    const response = await request(environment.connectionString).get('/metadata/sub');
    expect(response.body).toStrictEqual({
      subject: 'sub',
      entry1: {
        value: 123,
        sequenceNumber: 1,
        signatures: {
          signature:
            '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333a',
          publicKey: '123456789012345678901234567890123456789012345678901234567890123a',
        },
      },
    });
  });

  test("should not retrieve an unexisting metadata object with unexisting subject: 'unexisting'", async () => {
    const response = await request(environment.connectionString).get('/metadata/unexisting');
    expect(response.text).toStrictEqual(
      '{"internalCode":"subjectNotFoundError","message":"A metadata object with that subject does not exists"}'
    );
  });
});

// describe('PUT /metadata/:subject', () => {
//   test('should reject updates of a known entry with a lower sequence number', async () => {
//     const response = await request(environment.connectionString)
//       .put('/metadata/sub')
//       .send({
//         subject: 'sub',
//         entry1: {
//           value: 'new value for entry1 with lower sequence number than previous',
//           sequenceNumber: 0,
//           signatures: {
//             signature:
//               '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333a',
//             publicKey: '123456789012345678901234567890123456789012345678901234567890123a',
//           },
//         },
//       });
//     expect(response.text).toEqual('Updated');
//   });
// });

afterAll(() => {
  connection.close();
});
