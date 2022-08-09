import { Express, Request, Response } from 'express'
import createError from "http-errors"
import httpStatus from "http-status"
import MetadataHandler from '../handlers/metadata'


import { Handlers } from '../handlers'

const buildRoutes = (
    handlers: Handlers,
    server: Express
) => {

    server.get("/health", async (request: Request<{ subject: string, propertyName: string }>, response: Response, next) => {
        if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
        const res = await handlers.getStatus(request, response)
        response.send(res)
    })

    // server.get("/metadata/:subject/property/:propertyName", async (request: Request<{ subject: string, propertyName: string }>, response: Response, next) => {
    //     if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
    //     const res = await handlers.getPropertyByName(request.params.subject, request.params.propertyName)
    //     response.send(res)
    // })

    // server.get("/metadata/:subject/properties", async (request: Request<{ subject: string }>, response: Response, next) => {
    //     if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
    //     const res = await handlers.getAllProperties(request.params.subject)
    //     response.send(res)
    // })

    // server.get("/metadata/:subject", async (request: Request<{ subject: string }>, response: Response, next) => {
    //     if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
    //     const res = await handlers.getSubject(request.params.subject)
    //     response.send(res)
    // })

    // server.post("/metadata/query", async (request: Request, response: Response, next) => {
    //     if (request.timedout) return next(createError(httpStatus.REQUEST_TIMEOUT, "Service Unavailable"))
    //     const { subjects, properties } = request.body
    //     if (!subjects) return next(createError(httpStatus.BAD_REQUEST, "subjects are required"))
    //     if (!properties) return next(createError(httpStatus.BAD_REQUEST, "properties are required"))
    //     const res = await handlers.queryMetadata(subjects, properties)
    //     response.send(res)
    // })
    return server;
};

export default buildRoutes;