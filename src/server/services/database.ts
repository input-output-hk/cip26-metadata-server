import { Db, Document } from 'mongodb';

import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DATABASE_COLLECTIONS } from '../utils/constants';

export interface DatabaseService {
  getObject(filters: Record<string, unknown>): Promise<Document | null>;
  insertObject(object: Record<string, unknown>): Promise<string>;
  queryObjects(subjects: string[], properties: string[]): Promise<Document[] | null>;
  updateObject(
    filters: Record<string, unknown>,
    updates: {
      creations: Record<string, unknown>;
      editions: Record<string, unknown>;
    }
  ): Promise<boolean>;
}

const configure = (logger: Logger, database: Db): DatabaseService => ({
  getObject: async (filters) => {
    logger.log.info('[Services][getObject] Getting object from db');
    logger.log.debug(`[Services][getObject] DATABASE_COLLECTIONS.METADATA: ${DATABASE_COLLECTIONS.METADATA}`);
    logger.log.debug(`[Services][getObject] filters: ${JSON.stringify(filters)}`);
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

  queryObjects: async (subjects: string[], properties: string[] = []) => {
    logger.log.info('[Services][queryObjects] Querying objects from db');
    try {
      const query = { subject: { $in: subjects } };
      const projection = {};
      for (const property of properties) {
        projection[property] = 1;
      }
      const objects = await database
        .collection(DATABASE_COLLECTIONS.METADATA)
        // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
        .find(query, { projection })
        .toArray();
      logger.log.info('[Services][queryObjects] Query results retrieved from db');
      return objects;
    } catch (error) {
      logger.log.error(
        `[Services][queryObjects] Could not retrieve query results. Error: ${error}`
      );
      throw ErrorFactory.databaseError(`Could not retrieve query results. Error: ${error}`);
    }
  },

  updateObject: async (filters, updates) => {
    logger.log.info('[Services][updateObject] Updating object on db');
    try {
      const query: { $set?: Record<string, unknown>; $addToSet?: Record<string, unknown> } = {};
      if (Object.keys(updates.creations).length > 0) {
        query.$set = updates.creations;
      }
      if (Object.keys(updates.editions).length > 0) {
        query.$addToSet = updates.editions;
      }
      await database
        .collection(DATABASE_COLLECTIONS.METADATA)
        .updateOne(filters, query, { upsert: true });
      logger.log.info('[Services][updateObject] Object updated on db');
      return true;
    } catch (error) {
      logger.log.error(`[Services][updateObject] Could not update object. Error: ${error}`);
      throw ErrorFactory.databaseError(`Could not update object. Error: ${error}`);
    }
  },
});

export default configure;
