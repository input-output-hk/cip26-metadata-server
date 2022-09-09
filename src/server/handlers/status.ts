import { Response } from 'express';
import { Request } from 'request-id/express';

import { Logger } from '../logger/logger';

export interface StatusHandler {
  getStatus(request: Request, response: Response): Response<{ up: boolean }>;
}

const configure = (logger: Logger): StatusHandler => ({
  getStatus: (request: Request, response: Response) => {
    logger.log.info(`[${request.requestId}][Handler][getStatus] Server status: UP`);
    return response.send({ up: true });
  },
});

export default configure;
