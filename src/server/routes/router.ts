import express, { Request, Response } from 'express'

export const router = express.Router();

router.route('/').get((request: Request, response: Response) => {
    response.send('Metadata Server');
});