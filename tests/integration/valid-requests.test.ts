import { Express } from 'express';
import httpStatus from 'http-status';
import { Db } from 'mongodb';
import { Server } from 'node:http';
import request from 'supertest';

import Environment from '../../src/server/config/environment';
import { connectToDatabase } from '../../src/server/db';
import { configure, Handlers } from '../../src/server/handlers';
import { Logger } from '../../src/server/logger/logger';
import buildServer from '../../src/server/server';
import { configure as configureServices, Services } from '../../src/server/services';

let connection: Server, database: Db, environment: Environment, server: Express, services: Services;

beforeAll(async () => {
  environment = new Environment();
  const logger = new Logger(environment.loggerLevel);
  database = await connectToDatabase(environment, logger);
  services = configureServices(logger, database);
  const handlers: Handlers = configure(logger, services);
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
