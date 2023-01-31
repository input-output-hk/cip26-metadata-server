export const DEFAULT_LOGGER_LEVEL = 'debug';

export const DB_CONNECTION_NEEDED_PARAMS = ['dbName', 'dbUri'];

export enum DATABASE_COLLECTIONS {
  METADATA = 'metadata',
}

export const WELL_KNOWN_PROPERTIES = [
  'preimage',
  'name',
  'description',
  'ticker',
  'decimals',
  'url',
  'logo',
  'policy',
  'subject',
];
