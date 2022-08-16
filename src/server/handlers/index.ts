import { Logger } from '../logger/logger';
import { Services } from '../services';
import metadataHandler, { MetadataHandler } from './metadata';
import statusHandler, { StatusHandler } from './status';

export interface Handlers {
  statusHandler: StatusHandler;
  metadataHandler: MetadataHandler;
}

export const configure = (logger: Logger, services: Services): Handlers => ({
  statusHandler: statusHandler(logger),
  metadataHandler: metadataHandler(logger, services),
});
