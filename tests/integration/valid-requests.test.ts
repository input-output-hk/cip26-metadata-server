import httpStatus from 'http-status';
import request from 'supertest';

const connectionString: string = process.env.TEST_CONNECTION_STRING as string;

describe('GET /health', () => {
  test('service should be up & running', async () => {
    const response = await request(connectionString).get('/health');
    expect(response).toMatchObject({ statusCode: httpStatus.OK, body: { up: true } });
  });
});
