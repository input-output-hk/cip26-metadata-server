import { Db } from 'mongodb';

import { Logger } from '../logger/logger';
import databaseService, { DatabaseService } from './database';

export interface Services {
  databaseService: DatabaseService;
}

export const configure = (logger: Logger, database: Db): Services => ({
  databaseService: databaseService(logger, database),
});
