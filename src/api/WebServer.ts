import Config from "../config/Config"
import Http from "./Http"
import MetadataHttp from "./metadata/MetadataHttp"

export default class WebServer {
    config: Config | undefined
    metadataHttp: MetadataHttp | undefined

    constructor() {
        this.config = undefined
        this.metadataHttp = undefined
    }

    boot() {
        this.createWebserverInstance().start()
    }

    createWebserverInstance() {
        return new Http(this.getConfig(), this.getMetadataHttp())
    }

    getConfig(): Config {
        if (this.config) return this.config
        this.config = new Config()
        return this.config
    }

    // getDatabase(): MongoDB {
    //     if (this.db) return this.db
    //     this.db = new MongoDB()
    //     return this.db
    // }

    getMetadataHttp(): MetadataHttp {
        if (this.metadataHttp) return this.metadataHttp
        this.metadataHttp = new MetadataHttp({ db: null }) //this.getDatabase()
        return this.metadataHttp
    }
}
