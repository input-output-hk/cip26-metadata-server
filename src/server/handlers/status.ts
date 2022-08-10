import { Request, Response } from 'express';

export interface StatusHandler {
  getStatus(req: Request, res: Response): Response<{ up: boolean }>;
}

const configure = (): StatusHandler => ({
  getStatus: (req: Request, res: Response) => {
    return res.send(true);
  },
});

export default configure;
