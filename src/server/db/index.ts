import { MongoClient } from 'mongodb';

import { CONNECTION_DATA } from '../../types/database';
import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DB_CONNECTION_NEEDED_PARAMS } from '../utils/constants';

export const connectToDatabase = (connectionData: CONNECTION_DATA, logger: Logger) => {
  if (!connectionData.dbName || !connectionData.dbUri) {
    throw ErrorFactory.databaseConnectionError(
      `Missing connection properties. All properties in ${DB_CONNECTION_NEEDED_PARAMS} should be set.`
    );
  }
  try {
    logger.log.info(
      `[DB][connectToDatabase] Initializing connection to ${connectionData.dbName} database`
    );
    const client = new MongoClient(connectionData.dbUri);
    return client.db(connectionData.dbName);
  } catch (error) {
    logger.log.error(
      `[DB][connectToDatabase] Error initializing connection to ${connectionData.dbName} database: ${error}`
    );
    throw error;
  }
};
