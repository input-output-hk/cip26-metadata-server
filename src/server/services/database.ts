import { Db, Document } from 'mongodb';

import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DATABASE_COLLECTIONS } from '../utils/constants';

export interface DatabaseService {
  getObject(filters: Record<string, unknown>): Promise<Document | null>;
  insertObject(object: Record<string, unknown>): Promise<string>;
}

const configure = (logger: Logger, database: Db): DatabaseService => ({
  getObject: async (filters) => {
    logger.log.info('[Services][getObject] Getting object from db');
    try {
      const object = await database.collection(DATABASE_COLLECTIONS.METADATA).findOne(filters);
      logger.log.info('[Services][getObject] Object retrieved');
      return object;
    } catch (error) {
      logger.log.error(`[Services][getObject] Could not insert object. Error: ${error}`);
      throw ErrorFactory.databaseError(`Could not insert object. Error: ${error}`);
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
});

export default configure;
