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
  const logger = new Logger(environment.loggerLevel);
  database = await connectToDatabase(environment, logger);
  services = configureServices(logger, database);
  const handlers: Handlers = configure(logger, services);
  const middlewares: Middlewares = buildMiddlewares(logger);
  server = buildServer(handlers, middlewares, environment, logger);
  connection = server.listen(environment.port);
});

describe('Validate metadata endpoints', () => {
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
});

afterAll(() => {
  connection.close();
});
