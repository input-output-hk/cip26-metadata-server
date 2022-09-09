import blake2 from 'blake2';
import cbor from 'cbor';
import { NextFunction, Response } from 'express';
import { Request } from 'request-id/express';
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
  if (!entry.signatures || entry.signatures.length === 0) {
    return false;
  }
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
    logger.log.info(`[${request.requestId}][Middleware][validateSignatures] Validating signatures`);
    try {
      for (const [key, value] of Object.entries(request.body)) {
        if (!WELL_KNOWN_PROPERTIES.includes(key)) {
          const validSignature = validateSignaturesForEntry(
            request.body.subject || request.params.subject,
            value as Entry,
            key
          );
          if (!validSignature) {
            logger.log.error(
              `[${request.requestId}][Middleware][validateSignatures] Entry '${key}' does not contain a valid signature`
            );
            return next(
              ErrorFactory.invalidSignatures(`Entry ${key} does not contain a valid signature`)
            );
          }
        }
      }
      return next();
    } catch (error) {
      logger.log.error(
        `[${request.requestId}][Middleware][validateSignatures] There was an internal error validating signatures: ${error}`
      );
      return next(
        ErrorFactory.unmappedError(`There was an internal error validating signatures: ${error}`)
      );
    }
  },
});

export default configure;
