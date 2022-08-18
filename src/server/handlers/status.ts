import { Request, Response } from 'express';

import { Logger } from '../logger/logger';

export interface StatusHandler {
  getStatus(request: Request, response: Response): Response<{ up: boolean }>;
}

const configure = (logger: Logger): StatusHandler => ({
  getStatus: (request: Request, response: Response) => {
    logger.log.info('[getStatus] Server status: UP');

    return response.send({ up: true });
  },
});

export default configure;
