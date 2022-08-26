import request from 'supertest';

import {
  invalidObject,
  validationErrors,
  validObjectWithManyProperties,
  validObjectWithOneEntry,
} from './utils/data';

const connectionString: string = process.env.TEST_CONNECTION_STRING as string;

describe('POST /metadata', () => {
  test('should not allow to create an invalid metadata object', async () => {
    const response = await request(connectionString).post('/metadata').send(invalidObject);
    expect(response.body).toStrictEqual(validationErrors);
  });

  test('should create a valid metadata object with one entry', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send(validObjectWithOneEntry);
    expect(response.text).toEqual('Created');
  });

  test('should not allow to create an object with duplicate subject', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send(validObjectWithOneEntry);
    expect(response.body).toStrictEqual({
      internalCode: 'subjectExistsError',
      message: 'A metadata object with that subject already exists',
    });
  });

  test('should create a valid metadata object with many properties', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send(validObjectWithManyProperties);
    expect(response.status).toEqual(201);
  });
});

describe('GET /metadata/:subject', () => {
  test("should retrieve an existing metadata object with subject: 'sub'", async () => {
    const response = await request(connectionString).get('/metadata/sub');
    expect(response.body).toStrictEqual(validObjectWithOneEntry);
  });

  test("should not retrieve an unexisting metadata object with unexisting subject: 'unexisting'", async () => {
    const response = await request(connectionString).get('/metadata/unexisting');
    expect(response.body).toStrictEqual({
      internalCode: 'subjectNotFoundError',
      message: 'A metadata object with that subject does not exists',
    });
  });
});

describe('GET /metadata/:subject/properties', () => {
  test("should retrieve all property names of an existing metadata object with subject: 'sub'", async () => {
    const response = await request(connectionString).get('/metadata/sub/properties');
    expect(response.body).toStrictEqual(['subject', 'entry1']);
  });

  test("should retrieve all property names of an existing metadata object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/properties');
    expect(response.body).toStrictEqual([
      'subject',
      'policy',
      'preimage',
      'name',
      'description',
      'ticker',
      'decimals',
      'url',
      'logo',
      'entry_property1',
      'entry_property2',
    ]);
  });

  test("should not retrieve properties of an unexisting metadata object with subject: 'unexisting'", async () => {
    const response = await request(connectionString).get('/metadata/unexisting/properties');
    expect(response.body).toStrictEqual({
      internalCode: 'subjectNotFoundError',
      message: 'A metadata object with that subject does not exists',
    });
  });
});
