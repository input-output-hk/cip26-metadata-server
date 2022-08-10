import { Logger } from '../logger/logger';
import statusHandler, { StatusHandler } from './status';

export interface Handlers {
  statusHandler: StatusHandler;
}

export const configure = (logger: Logger): Handlers => ({
  statusHandler: statusHandler(logger),
});
