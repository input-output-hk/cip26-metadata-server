import { Express } from 'express'
import request from 'supertest'
import httpStatus from 'http-status'
import buildServer from '../../server/server';
import Environment from "../../config/environment"
import { configure, Handlers } from '../../server/handlers'
import { Server } from 'http';

let environment: Environment, server: Express, connection: Server;

beforeEach(() => {
    environment = new Environment();
    const handlers: Handlers = configure()
    server = buildServer(handlers, environment)
    connection = server.listen(environment.port)
})

describe('GET /health', () => {
    test('service should be up & running', async () => {
        const response = await request(environment.connectionString).get('/health')
        expect(response.statusCode).toEqual(httpStatus.OK)
        expect(response.body).toBe(true)
    })
})

afterEach(() => {
    connection.close()
})