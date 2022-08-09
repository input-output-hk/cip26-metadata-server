import { Request, Response } from 'express'
import { Logger } from '../../logger/logger';

export interface StatusHandler {
    getStatus(
        req: Request,
        res: Response
    ): Response<{ up: boolean }>;
}

const configure = (logger: Logger): StatusHandler => ({
    getStatus: (req: Request, res: Response) => {
        logger.log.info('[getStatus] Server status: UP');
        return res.send(true);
    }
});

export default configure;