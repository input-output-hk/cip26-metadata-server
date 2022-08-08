import WebServer from "./api/WebServer"

async function startServer() {
  try {
    const webServer = new WebServer()
    webServer.boot()
  } catch (e: any) {
    console.log(`Unhandled error: ${e.message}\n${e.stack}`)
  }
}

startServer()