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
};

export const validObjectWithOneEntry = {
  subject: 'sub',
  entry1: {
    value: 123,
    sequenceNumber: 1,
    signatures: {
      signature:
        '3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333a',
      publicKey: '123456789012345678901234567890123456789012345678901234567890123a',
    },
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
    instancePath: '/contact/signatures/publicKey',
    schemaPath: '#/definitions/signatures/properties/publicKey/minLength',
    keyword: 'minLength',
    params: {
      limit: 64,
    },
    message: 'must NOT have fewer than 64 characters',
  },
  {
    instancePath: '/contact/signatures/signature',
    schemaPath: '#/definitions/signatures/properties/signature/minLength',
    keyword: 'minLength',
    params: {
      limit: 128,
    },
    message: 'must NOT have fewer than 128 characters',
  },
];
