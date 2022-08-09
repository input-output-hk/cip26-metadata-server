import statusHandler, { StatusHandler } from './status';

export interface Handlers
    extends StatusHandler { }

export const configure = (
): Handlers => ({
    ...statusHandler()
});