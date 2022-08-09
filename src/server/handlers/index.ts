import statusHandler, { StatusHandler } from './status';

export interface Handlers {
    statusHandler: StatusHandler;
}

export const configure = (
): Handlers => ({
    statusHandler: statusHandler()
});