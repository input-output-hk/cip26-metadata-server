/* eslint-disable sonarjs/no-duplicate-string */
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

export const invalidObjectSanitizationErrors = [
  {
    instancePath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: {
      missingProperty: 'subject',
    },
    message: "must have required property 'subject'",
  },
  {
    instancePath: '/_ubject$__',
    schemaPath: '#/type',
    keyword: 'type',
    params: {
      type: 'object',
    },
    message: 'must be object',
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

export const invalidSubjectUpdateObject = {
  subject: 'sub',
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
};

export const invalidEntryUpdateObject = {
  entry_property1: {
    value: 'vavue 1',
    sequenceNumber: 1,
    signatures: [
      {
        signature: 'abc',
        publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
      },
    ],
  },
};

export const updateSubjectValidationErrors = [
  {
    instancePath: '/subject',
    keyword: 'false schema',
    message: 'boolean schema is false',
    params: {},
    schemaPath: '#/properties/subject/false schema',
  },
];

export const updateEntryValidationErrors = [
  {
    instancePath: '/entry_property1/signatures/0/signature',
    keyword: 'minLength',
    message: 'must NOT have fewer than 128 characters',
    params: {
      limit: 128,
    },
    schemaPath: '#/definitions/signature/properties/signature/minLength',
  },
];

export const invalidSequenceNumberUpdateObject = {
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

export const validUpdateObject = {
  entry_property1: {
    value: 1,
    sequenceNumber: 2,
    signatures: [
      {
        signature:
          'b0178ad804ad831808f02fba52b23906596c9d7695ff9f457c9b6df5f22f662249073ea9f794e32fcb704663aaacdc465169ea320b7a6b94d8652e797fac900e',
        publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
      },
    ],
  },
};

export const unexistentUpdateObject = {
  entry_property1: {
    value: 1,
    sequenceNumber: 1,
    signatures: [
      {
        publicKey: 'e7dd325938ef5a6819127e9a5bc5a661498de8a58c57207674c295e1de22e123',
        signature:
          'c8510dc2d9bc8ddd264f545f8092fe3ca5608ba720ebad4a888295442ff4670bebd9b9ff183dc5aa16db4854d7609c0911061d18bcf76c8e9f47915e1b225408',
      },
    ],
  },
};

export const querySanitizationErrors = [
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
      additionalProperty: '_ubject$__',
    },
    message: 'must NOT have additional properties',
  },
  {
    instancePath: '',
    schemaPath: '#/additionalProperties',
    keyword: 'additionalProperties',
    params: {
      additionalProperty: 'prop_erti_es',
    },
    message: 'must NOT have additional properties',
  },
];
