import { Db, Document } from 'mongodb';

import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DATABASE_COLLECTIONS } from '../utils/constants';

export interface DatabaseService {
  getObject(filters: Record<string, unknown>): Promise<Document | null>;
  insertObject(object: Record<string, unknown>): Promise<string>;
  ensureExists(filters: Record<string, unknown>, expectedExists: boolean): Promise<Document | null>;
}

const configure = (logger: Logger, database: Db): DatabaseService => ({
  getObject: async (filters) => {
    logger.log.info('[Services][getObject] Getting object from db');
    try {
      const object = await database.collection(DATABASE_COLLECTIONS.METADATA).findOne(filters);
      logger.log.info('[Services][getObject] Object retrieved from db');
      return object;
    } catch (error) {
      logger.log.error(`[Services][getObject] Could not retrieve object. Error: ${error}`);
      throw ErrorFactory.databaseError(`Could not retrieve object. Error: ${error}`);
    }
  },

  insertObject: async (object) => {
    logger.log.info('[Services][insertObject] Inserting object on db');
    try {
      const response = await database.collection(DATABASE_COLLECTIONS.METADATA).insertOne(object);
      logger.log.info('[Services][insertObject] Object inserted on db');
      return response.insertedId.toString();
    } catch (error) {
      logger.log.error(`[Services][insertObject] Could not insert object. Error: ${error}`);
      throw ErrorFactory.databaseError(`Could not insert object. Error: ${error}`);
    }
  },

  ensureExists: async (filters, expectedExists: boolean) => {
    logger.log.info('[Services][ensureExists] Getting object from db');
    let object: Document | null;
    try {
      object = await database.collection(DATABASE_COLLECTIONS.METADATA).findOne(filters);
      logger.log.info('[Services][ensureExists] Object retrieved');
    } catch (error) {
      logger.log.error(`[Services][ensureExists] Could not retrieve object. Error: ${error}`);
      throw ErrorFactory.databaseError(`Could not retrieve object. Error: ${error}`);
    }
    if (object && !expectedExists) {
      logger.log.error(
        `[Services][ensureExists] Metadata object with subject ${filters.subject} already exists`
      );
      throw ErrorFactory.subjectExistsError('A metadata object with that subject already exists');
    }
    if (!object && expectedExists) {
      logger.log.error(
        `[Services][ensureExists] Metadata object with subject ${filters.subject} does not exists`
      );
      throw ErrorFactory.subjectNotFoundError(
        'A metadata object with that subject does not exists'
      );
    }
    return object;
  },
});

export default configure;
