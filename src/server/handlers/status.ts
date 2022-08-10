import { Request, Response } from 'express';

export interface StatusHandler {
  getStatus(request: Request, response: Response): Response<{ up: boolean }>;
}

const configure = (): StatusHandler => ({
  getStatus: (request: Request, response: Response) => {
    return response.send(true);
  },
});

export default configure;
