import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import createError from "http-errors"
import httpStatus from "http-status"
import timeout from "connect-timeout"
import Config from "../config/Config"
import MetadataHttp from "./metadata/MetadataHttp"

export default class Http {
    config: Config
    metadataHttp: MetadataHttp

    constructor(config: Config, metadataHttp: MetadataHttp) {
        this.config = config
        this.metadataHttp = metadataHttp
    }

    start() {
        const app: Express = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(timeout("30s"))

        app.get('/', (request: Request, response: Response) => {
            response.send('Metadata Server');
        });

        app.get("/metadata/:subject/property/:propertyName", async (request: Request<{ subject: string, propertyName: string }>, response: Response, next) => {
            if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
            const res = await this.metadataHttp.getPropertyByName(request.params.subject, request.params.propertyName)
            response.send(res)
        })

        app.get("/metadata/:subject/properties", async (request: Request<{ subject: string }>, response: Response, next) => {
            if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
            const res = await this.metadataHttp.getAllProperties(request.params.subject)
            response.send(res)
        })

        app.get("/metadata/:subject", async (request: Request<{ subject: string }>, response: Response, next) => {
            if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
            const res = await this.metadataHttp.getSubject(request.params.subject)
            response.send(res)
        })

        app.post("/metadata/query", async (request: Request, response: Response, next) => {
            if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
            const { subjects, properties } = request.body
            if (!subjects) return next(createError(httpStatus.BAD_REQUEST, "subjects are required"))
            if (!properties) return next(createError(httpStatus.BAD_REQUEST, "properties are required"))
            const res = await this.metadataHttp.queryMetadata(subjects, properties)
            response.send(res)
        })

        app.listen(this.config.port, () => {
            console.log(`⚡️[server]: Server is running at http://${this.config.host}:${this.config.port}/metadata`);
        });

    }
}