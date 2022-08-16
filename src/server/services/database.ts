import { Db } from 'mongodb';

import { ErrorFactory } from '../errors/error-factory';
import { Logger } from '../logger/logger';
import { DATABASE_COLLECTIONS } from '../utils/constants';

export interface DatabaseService {
  // TO DO: This method should be deleted in next mr.
  getRandomObject(): Promise<unknown>;
}

const configure = (logger: Logger, database: Db): DatabaseService => ({
  getRandomObject: () => {
    logger.log.info('[getRandomObject] Getting random object from db');
    return database
      .collection(DATABASE_COLLECTIONS.METADATA)
      .findOne({ test: true })
      .catch((error) => {
        logger.log.error(
          `[getRandomObject] Could not get random object from database. Error: ${error}`
        );
        throw ErrorFactory.databaseError(`Could not get random object. Error: ${error}`);
      });
  },
});

export default configure;
