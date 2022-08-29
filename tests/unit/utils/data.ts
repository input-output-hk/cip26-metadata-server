export const metadata = { subject: 'some-subject' };

export const objectWithSubject = { subject: 'some-subject' };

export const unmappedObject = {
  subject: 'subject',
  entry: {
    value: true,
    sequenceNumber: 2,
    signatures: [],
  },
};

export const mappedObject = {
  subject: 'subject',
  entry: [
    {
      value: true,
      sequenceNumber: 2,
      signatures: [],
    },
  ],
};

export const objectFromDatabase = {
  _id: 'abc',
  subject: 'subject object #2',
  entry: [
    {
      value: 'value object #2',
      sequenceNumber: 1,
      signatures: [
        {
          signature: '79a4601',
          publicKey: 'bc77d04',
        },
      ],
    },
    {
      value: 'value object #2, version 2 ',
      sequenceNumber: 2,
      signatures: [
        {
          signature: '79a4601',
          publicKey: 'bc77d04',
        },
      ],
    },
  ],
};

export const objectFromResponse = {
  subject: 'subject object #2',
  entry: {
    value: 'value object #2, version 2 ',
    sequenceNumber: 2,
    signatures: [
      {
        signature: '79a4601',
        publicKey: 'bc77d04',
      },
    ],
  },
};
