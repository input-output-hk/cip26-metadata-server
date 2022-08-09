import { Express } from 'express'
import { Handlers } from '../handlers'

const buildRoutes = (
    { statusHandler }: Handlers,
    server: Express
) => {
    server.get("/health", statusHandler.getStatus);
};

export default buildRoutes;