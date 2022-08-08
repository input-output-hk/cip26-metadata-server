import createError from "http-errors"
import httpStatus from "http-status"

export default class MetadataHttp {
    db: any

    constructor(db: any) {
        this.db = db
    }

    async getPropertyByName(subject: string, propertyName: string) {
        try {
            return this.db.query(subject, propertyName)
        } catch (e: any) {
            return createError(httpStatus.INTERNAL_SERVER_ERROR, e.message)
        }
    }

    async getAllProperties(subject: string) {
        try {
            return this.db.query(subject)
        } catch (e: any) {
            return createError(httpStatus.INTERNAL_SERVER_ERROR, e.message)
        }
    }

    async getSubject(subject: string) {
        try {
            return this.db.query(subject)
        } catch (e: any) {
            return createError(httpStatus.INTERNAL_SERVER_ERROR, e.message)
        }
    }

    async queryMetadata(subjects: string[], properties: string[]) {
        try {
            this.db.query(subjects, properties)
        } catch (e: any) {
            return createError(httpStatus.INTERNAL_SERVER_ERROR, e.message)
        }
    }

}
