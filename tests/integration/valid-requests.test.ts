import { Express } from 'express';
import httpStatus from 'http-status';
import { Server } from 'node:http';
import request from 'supertest';

import Environment from '../../src/server/config/environment';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import buildServer from '../../src/server/server';

let connection: Server, environment: Environment, server: Express;

beforeEach(() => {
  environment = new Environment();
  const logger = new Logger(environment.loggerLevel);
  const handlers: Handlers = configure(logger);
  server = buildServer(handlers, environment, logger);
  connection = server.listen(environment.port);
});

describe('GET /health', () => {
  test('service should be up & running', async () => {
    const response = await request(environment.connectionString).get('/health');
    expect(response.statusCode).toEqual(httpStatus.OK);
    expect(response.body).toBe(true);
  });
});

afterEach(() => {
  connection.close();
});
