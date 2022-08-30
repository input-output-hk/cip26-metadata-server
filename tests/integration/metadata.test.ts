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

  test('should fail if all of the signatures are invalid for a property. Check status', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send({
        ...validObjectWithOneEntry,
        entry_property1: {
          ...validObjectWithOneEntry.entry_property1,
          signatures: [
            {
              signature:
                '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba001',
              publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
            },
          ],
        },
      });
    expect(response.status).toEqual(400);
  });

  test('should fail if all of the signatures are invalid for a property. Check internalCode', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send({
        ...validObjectWithOneEntry,
        entry_property1: {
          ...validObjectWithOneEntry.entry_property1,
          signatures: [
            {
              signature:
                '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba001',
              publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
            },
          ],
        },
      });
    expect(response.body.internalCode).toEqual('invalidSignatures');
  });

  test('should pass if on of the signatures is valid for a property', async () => {
    const response = await request(connectionString)
      .post('/metadata')
      .send({
        ...validObjectWithOneEntry,
        entry_property1: {
          ...validObjectWithOneEntry.entry_property1,
          signatures: [
            {
              signature:
                '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba001',
              publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
            },
            {
              signature:
                '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba000',
              publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
            },
          ],
        },
      });
    expect(response.body.internalCode).toEqual('subjectExistsError');
  });
});

describe('GET /metadata/:subject', () => {
  test("should retrieve an existing metadata object with subject: 'valid'", async () => {
    const response = await request(connectionString).get('/metadata/valid');
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
  test("should retrieve all property names of an existing metadata object with subject: 'valid'", async () => {
    const response = await request(connectionString).get('/metadata/valid/properties');
    expect(response.body).toStrictEqual(['subject', 'entry_property1']);
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
