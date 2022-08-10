import dotenv from 'dotenv';

import { ENV_VAR } from '../../types/environment';

dotenv.config();

export default class Environment {
  env: ENV_VAR;
  port: ENV_VAR;
  host: ENV_VAR;
  loggerLevel: ENV_VAR;
  connectionString: ENV_VAR;

  constructor() {
    this.env = process.env.NODE_ENV;
    this.port = process.env.PORT;
    this.host = process.env.HOST;
    this.connectionString = `http://${process.env.HOST}:${process.env.PORT}`;
  }
}
