export const validObjectWithOneEntry = {
  subject: 'valid',
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
};

export const validObjectWithManyProperties = {
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
  url: 'https://cip26metadata.apps.atixlabs.xyz/health',
  logo: 'aGVsbG8K',
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
};

export const invalidObject = {
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
  token: {
    value: 'ADA',
    sequenceNumber: 1,
    signatures: [
      {
        signature: '79a4601',
        publicKey: 'bc77d04',
      },
    ],
  },
};

export const validationErrors = [
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
    instancePath: '/contact/signatures',
    schemaPath: '#/type',
    keyword: 'type',
    params: {
      type: 'array',
    },
    message: 'must be array',
  },
  {
    instancePath: '/token/signatures/0/publicKey',
    schemaPath: '#/definitions/signature/properties/publicKey/minLength',
    keyword: 'minLength',
    params: {
      limit: 64,
    },
    message: 'must NOT have fewer than 64 characters',
  },
  {
    instancePath: '/token/signatures/0/signature',
    schemaPath: '#/definitions/signature/properties/signature/minLength',
    keyword: 'minLength',
    params: {
      limit: 128,
    },
    message: 'must NOT have fewer than 128 characters',
  },
];

export const queryValidationErrors = [
  {
    instancePath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: {
      missingProperty: 'subjects',
    },
    message: "must have required property 'subjects'",
  },
  {
    instancePath: '',
    schemaPath: '#/additionalProperties',
    keyword: 'additionalProperties',
    params: {
      additionalProperty: 'invalid_list_of_subjects',
    },
    message: 'must NOT have additional properties',
  },
  {
    instancePath: '/properties',
    schemaPath: '#/properties/properties/minItems',
    keyword: 'minItems',
    params: {
      limit: 1,
    },
    message: 'must NOT have fewer than 1 items',
  },
];
