/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';

import {
  invalidObject,
  queryValidationErrors,
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

describe('GET /metadata/:subject/property/:propertyName', () => {
  test("should return the property value of the given property name: 'entry_property1' for an object with subject: 'valid'", async () => {
    const response = await request(connectionString).get(
      '/metadata/valid/property/entry_property1'
    );
    expect(response.body).toStrictEqual({
      entry_property1: {
        value: 'valid 1',
        sequenceNumber: 1,
        signatures: [
          {
            signature:
              '25836958b24118416e056cedd9019729d8941d338858bdcd5dfd0ca76dda29ccf021286296544a6f88b335c09dcc10da660bd6e890db4f6e0bfa1b27794ba000',
            publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
          },
        ],
      },
    });
  });

  test("should return the property value of the given property name: 'subject' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/subject');
    expect(response.body).toStrictEqual({ subject: 'valid1' });
  });

  test("should return the property value of the given property name: 'policy' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/policy');
    expect(response.body).toStrictEqual({
      policy: 'FFFFFF00000000001111111111222222222233333333334444444444',
    });
  });

  test("should return the property value of the given property name: 'preimage' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/preimage');
    expect(response.body).toStrictEqual({ preimage: { alg: 'sha1', msg: 'AADDBBCC' } });
  });

  test("should return the property value of the given property name: 'name' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/name');
    expect(response.body).toStrictEqual({ name: 'This is the name' });
  });

  test("should return the property value of the given property name: 'description' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/description');
    expect(response.body).toStrictEqual({ description: 'This is the description' });
  });

  test("should return the property value of the given property name: 'ticker' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/ticker');
    expect(response.body).toStrictEqual({ ticker: 'ADA/USDT' });
  });

  test("should return the property value of the given property name: 'decimals' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/decimals');
    expect(response.body).toStrictEqual({ decimals: 18 });
  });

  test("should return the property value of the given property name: 'url' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/url');
    expect(response.body).toStrictEqual({ url: 'https://cip26metadata.apps.atixlabs.xyz/health' });
  });

  test("should return the property value of the given property name: 'logo' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/logo');
    expect(response.body).toStrictEqual({ logo: 'aGVsbG8K' });
  });

  test("should return the property value of the given property name: 'entry_property1' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get(
      '/metadata/valid1/property/entry_property1'
    );
    expect(response.body).toStrictEqual({
      entry_property1: {
        value: 'vavue 1',
        sequenceNumber: 1,
        signatures: [
          {
            signature:
              '492fb358cf3e15bb65c08182a52918ee5b4185afe9ed43ce49a68ee0bc2becebe782d5acd348b636ad28a144c3aa07135f0dc38de2949b4d3e72f85d39020002',
            publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
          },
        ],
      },
    });
  });

  test("should return the property value of the given property name: 'entry_property2' for an object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get(
      '/metadata/valid1/property/entry_property2'
    );
    expect(response.body).toStrictEqual({
      entry_property2: {
        value: 'value 2',
        sequenceNumber: 1,
        signatures: [
          {
            signature:
              'f8e4b084c40c92904f162e703335e48c203f4f042217f6b3b2bb529424f89da313cb93af4e29857df563fcac35c406527e7e2588cdc9a0baf34a00635e294201',
            publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
          },
        ],
      },
    });
  });

  test("should return the property value of the given property name: 'subject' for an unexisting metadata object with subject: 'unexisting'", async () => {
    const response = await request(connectionString).get('/metadata/unexisting/property/subject');
    expect(response.body).toStrictEqual({
      internalCode: 'subjectNotFoundError',
      message: 'A metadata object with that subject does not exists',
    });
  });

  test("should not retrieve unexisting property 'unexisting' of an existing metadata object with subject: 'valid1'", async () => {
    const response = await request(connectionString).get('/metadata/valid1/property/unexisting');
    expect(response.body).toStrictEqual({
      internalCode: 'propertyNotFoundError',
      message: "Property 'unexisting' does not exists",
    });
  });
});

describe('POST /metadata/query', () => {
  test('should not allow to query metadata objects when request body is invalid', async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({ invalid_list_of_subjects: ['valid', 'valid1'], properties: [] });
    expect(response.body).toStrictEqual(queryValidationErrors);
  });

  test('should return a list of metadata objects with all their properties when only a list of subjects is provided', async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({ subjects: ['valid', 'unexisting', 'valid1'] });
    expect(response.body).toStrictEqual([
      { ...validObjectWithOneEntry },
      { ...validObjectWithManyProperties },
    ]);
  });

  test('should return a one item list of metadata objects with a single property when single subject & single property are provided', async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({ subjects: ['valid'], properties: ['entry_property1'] });
    expect(response.body).toStrictEqual([
      { entry_property1: validObjectWithOneEntry.entry_property1 },
    ]);
  });

  test('should return an empty list of metadata objects when only unexisting subjects are provided', async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({ subjects: ['unexisting'] });
    expect(response.body).toStrictEqual([]);
  });

  test("should return a list of metadata objects with their properties narrowed down to only those specified by 'properties'", async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({
        subjects: ['valid', 'valid1'],
        properties: ['subject', 'policy', 'preimage', 'name', 'description', 'ticker', 'decimals'],
      });
    expect(response.body).toStrictEqual([
      { subject: 'valid' },
      {
        subject: 'valid1',
        policy: 'FFFFFF00000000001111111111222222222233333333334444444444',
        preimage: {
          alg: 'sha1',
          msg: 'AADDBBCC',
        },
        name: 'This is the name',
        description: 'This is the description',
        ticker: 'ADA/USDT',
        decimals: 18,
      },
    ]);
  });

  test('should return a list of empty objects when only unexisting properties are provided', async () => {
    const response = await request(connectionString)
      .post('/metadata/query')
      .send({
        subjects: ['valid', 'valid1'],
        properties: ['unexisting', 'other'],
      });
    expect(response.body).toStrictEqual([{}, {}]);
  });
});
