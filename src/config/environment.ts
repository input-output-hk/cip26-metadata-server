import dotenv from 'dotenv';
dotenv.config();

export default class Environment {
    env: string | undefined
    port: string | undefined
    host: string | undefined
    connectionString: string | undefined

    constructor() {
        this.env = process.env.NODE_ENV
        this.port = process.env.PORT
        this.host = process.env.HOST
        this.connectionString = `http://${process.env.HOST}:${process.env.PORT}`
    }
}