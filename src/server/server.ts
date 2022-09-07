import bodyParser from 'body-parser';
import timeout from 'connect-timeout';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import promMid from 'express-prometheus-middleware';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import Environment from './config/environment';
import { errorHandler } from './errors/error-handler';
import { Handlers } from './handlers';
import { Logger } from './logger/logger';
import { Middlewares } from './middlewares';
import buildRoutes from './routes/router';
const swaggerDocument = YAML.load('./swagger.yaml');

const buildServer = (
  handlers: Handlers,
  middlewares: Middlewares,
  environment: Environment,
  logger: Logger
): Express => {
  const server: Express = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(timeout('30s'));
  server.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.log.warn(
          `Incomming request to ${req.path} contains invalid characters in request.${key}. Those characters were replaced by '_'`
        );
      },
    })
  );

  server.use(
    promMid({
      metricsPath: '/metrics',
      collectDefaultMetrics: true,
      requestDurationBuckets: [0.1, 0.5, 1, 1.5],
      requestLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
      responseLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
    })
  );

  server.use((request, response, next) => {
    logger.log.info(`New request: ${request.method} ${request.path}`);
    return next();
  });
  server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  buildRoutes(handlers, middlewares, server);
  server.use(errorHandler);
  return server;
};

export default buildServer;
