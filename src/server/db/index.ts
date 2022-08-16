import { MongoClient } from 'mongodb';

import { CONNECTION_DATA } from '../../types/database';
import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DB_CONNECTION_NEEDED_PARAMS } from '../utils/constants';

export const connectToDatabase = (connectionData: CONNECTION_DATA, logger: Logger) => {
  if (
    !connectionData.dbCluster ||
    !connectionData.dbName ||
    !connectionData.dbPassword ||
    !connectionData.dbUsername
  ) {
    throw ErrorFactory.databaseConnectionError(
      `Missing connection properties. All properties in ${DB_CONNECTION_NEEDED_PARAMS} should be set.`
    );
  }
  try {
    logger.log.info(
      `[connectToDatabase] Initializing connection to ${connectionData.dbName} database`
    );
    const uri = `mongodb+srv://${connectionData.dbUsername}:${connectionData.dbPassword}@${connectionData.dbCluster}?retryWrites=true&writeConcern=majority`;
    const client = new MongoClient(uri);
    return client.db(connectionData.dbName);
  } catch (error) {
    logger.log.error(
      `[connectToDatabase] Error initializing connection to ${connectionData.dbName} database: ${error}`
    );
    throw error;
  }
};
