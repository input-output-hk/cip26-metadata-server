import dotenv from 'dotenv';

import { ENV_VAR } from '../../types/environment';

dotenv.config();

export default class Environment {
  env: ENV_VAR;
  port: ENV_VAR;
  host: ENV_VAR;
  loggerLevel: ENV_VAR;
  connectionString: ENV_VAR;
  dbPassword: ENV_VAR;
  dbUsername: ENV_VAR;
  dbCluster: ENV_VAR;
  dbName: ENV_VAR;

  constructor() {
    this.env = process.env.NODE_ENV;
    this.port = process.env.PORT;
    this.host = process.env.HOST;
    this.connectionString = `http://${process.env.HOST}:${process.env.PORT}`;
    this.dbPassword = process.env.DB_PASS;
    this.dbUsername = process.env.DB_USERNAME;
    this.dbCluster = process.env.DB_CLUSTER;
    this.dbName = process.env.DB_NAME;
  }
}
