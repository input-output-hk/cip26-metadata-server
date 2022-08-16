import { Express } from 'express';
import httpStatus from 'http-status';
import { Server } from 'node:http';
import request from 'supertest';

import Environment from '../../src/server/config/environment';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import buildServer from '../../src/server/server';
import { config } from './config';

let connection: Server, environment: Environment, server: Express;

beforeAll(() => {
  environment = config;
  const logger = new Logger(environment.loggerLevel);
  const handlers: Handlers = configure(logger);
  server = buildServer(handlers, environment, logger);
  connection = server.listen(environment.port);
});

describe('GET /health', () => {
  test('service should be up & running', async () => {
    const response = await request(environment.connectionString).get('/health');
    expect(response).toMatchObject({ statusCode: httpStatus.OK, body: { up: true } });
  });
});

afterAll(() => {
  connection.close();
});
