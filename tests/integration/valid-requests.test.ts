import { Express } from 'express';
import httpStatus from 'http-status';
import { Server } from 'node:http';
import request from 'supertest';

import Environment from '../../src/server/config/environment';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import { buildMiddlewares, Middlewares } from '../../src/server/middlewares';
import buildServer from '../../src/server/server';

let connection: Server, environment: Environment, server: Express;

beforeAll(() => {
  environment = new Environment();
  const logger = new Logger(environment.loggerLevel);
  const handlers: Handlers = configure(logger);
  const middlewares: Middlewares = buildMiddlewares(logger);
  server = buildServer(handlers, middlewares, environment, logger);
  connection = server.listen(environment.port);
});

describe('GET /health', () => {
  test('service should be up & running', async () => {
    const response = await request(environment.connectionString).get('/health');
    expect(response).toMatchObject({ statusCode: httpStatus.OK, body: true });
  });
});

afterAll(() => {
  connection.close();
});
