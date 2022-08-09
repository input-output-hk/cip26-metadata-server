import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import timeout from "connect-timeout"
import Environment from '../config/environment'
import MetadataHandler from './handlers/metadata'
import buildRoutes from './routes/router'

import { Handlers } from './handlers'
import { Logger } from '../logger/logger'

const buildServer = (
    handlers: Handlers,
    environment: Environment,
    logger: Logger
): Express => {
    const server: Express = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(timeout("30s"))

    server.use((req, res, next) => {
        logger.log.info(`New request: ${req.method} ${req.path}`);
        return next();
    });

    buildRoutes(handlers, server)
    return server;
};

export default buildServer;