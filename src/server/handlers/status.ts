import { Express, Request, Response } from 'express'

export interface StatusHandler {
    getStatus(
        req: Request,
        res: Response
    ): Response<{ up: boolean }>;
}


// const getStatus = (req: Request, res: Response) => {
//     return res.send(true);
// }

const configure = (): StatusHandler => ({
    getStatus: (req: Request, res: Response) => {
        return res.send(true);
    }
});

export default configure;