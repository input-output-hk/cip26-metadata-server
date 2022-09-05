import blake2 from 'blake2';
import cbor from 'cbor';
import { NextFunction, Request, Response } from 'express';
import nacl from 'tweetnacl';

import { Entry } from '../../types/metadata';
import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { WELL_KNOWN_PROPERTIES } from '../utils/constants';

const encodeMessage = (subject: string, entry: Entry, entryName: string) => {
  const subjectHash = blake2.createHash('blake2b', { digestLength: 32 });
  const entryNameHash = blake2.createHash('blake2b', { digestLength: 32 });
  const valueHash = blake2.createHash('blake2b', { digestLength: 32 });
  const snHash = blake2.createHash('blake2b', { digestLength: 32 });
  const concatHash = blake2.createHash('blake2b', { digestLength: 32 });
  return concatHash
    .update(
      Buffer.from(
        `${subjectHash.update(cbor.encode(subject)).digest('hex')}${entryNameHash
          .update(cbor.encode(entryName))
          .digest('hex')}${valueHash.update(cbor.encode(entry.value)).digest('hex')}${snHash
          .update(cbor.encode(entry.sequenceNumber))
          .digest('hex')}`
      )
    )
    .digest('hex');
};

const validateSignaturesForEntry = (subject: string, entry: Entry, entryName: string): boolean => {
  for (const element of entry.signatures) {
    try {
      const encodedMessage = encodeMessage(subject, entry, entryName);
      if (
        nacl.sign.detached.verify(
          Buffer.from(encodedMessage, 'hex'),
          Buffer.from(element.signature, 'hex'),
          Buffer.from(element.publicKey, 'hex')
        )
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
};

export interface SignaturesMiddleware {
  validateSignatures(request: Request, response: Response, next: NextFunction): void;
}

const configure = (logger: Logger): SignaturesMiddleware => ({
  validateSignatures: (request: Request, response: Response, next: NextFunction) => {
    logger.log.info('[Middleware][validateSignatures] Validating signatures');
    for (const [key, value] of Object.entries(request.body)) {
      if (!WELL_KNOWN_PROPERTIES.includes(key)) {
        logger.log.error(`Entry ${key} does not contain a valid signature`);
        const validSignature = validateSignaturesForEntry(
          request.body.subject || request.params.subject,
          value as Entry,
          key
        );
        if (!validSignature) {
          logger.log.error(`Entry ${key} does not contain a valid signature`);
          return next(
            ErrorFactory.invalidSignatures(`Entry ${key} does not contain a valid signature`)
          );
        }
      }
    }
    return next();
  },
});

export default configure;
