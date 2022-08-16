import { NextFunction, Request, Response } from 'express';

import { Logger } from '../logger/logger';
import { Services } from '../services';

export interface MetadataHandler {
  // TO DO: This method is an example and should be deleted
  getRandomObject(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<{ unknown }> | void>;
}

const configure = (logger: Logger, services: Services): MetadataHandler => ({
  getRandomObject: async (request: Request, response: Response, next: NextFunction) => {
    logger.log.info('[getRandomObject] Getting random object');
    return services.databaseService
      .getRandomObject()
      .then((randomObject) => {
        logger.log.info('[getRandomObject] Random object retrieved');
        return response.send(randomObject);
      })
      .catch((error) => {
        return next(error);
      });
  },
});

export default configure;
