import { Logger } from '../../src/server/logger/logger';

export default async () => {
  if (process.env.NODE_ENV !== 'integration') {
    return;
  }
  const logger = new Logger('info');
  logger.log.info('[Global][Teardown] Teardown mongodb server...');
  // eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-var-requires
  await require('@shelf/jest-mongodb/lib/teardown.js')();

  if (global.__SERVER__) {
    const server = global.__SERVER__;
    const port = server.address().port;
    logger.log.info(`[Global][Teardown] Teardown server at port ${port}`);
    server.close();
  }
};
