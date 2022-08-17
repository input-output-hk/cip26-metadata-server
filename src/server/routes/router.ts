import { Express } from 'express';

import { Handlers } from '../handlers';

const buildRoutes = ({ statusHandler, metadataHandler }: Handlers, server: Express) => {
  server.get('/health', statusHandler.getStatus);
  server.post('/metadata', metadataHandler.createObject);
};

export default buildRoutes;
