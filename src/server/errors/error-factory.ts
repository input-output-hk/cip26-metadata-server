import { ErrorObject } from 'ajv';

import { BuildApiErrorFunction } from '../../types/errors';

export class ApiError extends Error {
  internalCode: string;
  statusCode: number;

  constructor(internalCode: string, message: string, statusCode: number) {
    super(message);

    this.internalCode = internalCode;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  validationErrors: ErrorObject[];
  internalCode: string;
  statusCode: number;

  constructor(validationErrors) {
    super('');
    this.validationErrors = validationErrors;
    this.internalCode = 'JsonSchemaValidationError';
    this.statusCode = 400;
  }
}

const errors = {
  UNMAPPED_ERROR: {
    internalCode: 'unmappedError',
    statusCode: 500,
  },
  DB_CONNECTION_ERROR: {
    internalCode: 'dbConnectionError',
    statusCode: 500,
  },
  DB_ERROR: {
    internalCode: 'dbError',
    statusCode: 500,
  },
  SUBJECT_EXISTS_ERROR: {
    internalCode: 'subjectExistsError',
    statusCode: 500,
  },
  SUBJECT_NOT_FOUND_ERROR: {
    internalCode: 'subjectNotFoundError',
    statusCode: 404,
  },
  OLDER_ENTRY_ERROR: {
    internalCode: 'olderEntryError',
    statusCode: 400,
  },
  PROPERTY_NOT_FOUND_ERROR: {
    internalCode: 'propertyNotFoundError',
    statusCode: 404,
  },
  INVALID_SIGNATURES: {
    internalCode: 'invalidSignatures',
    statusCode: 400,
  },
};

const buildApiError = (
  error: {
    internalCode: string;
    statusCode: number;
  },
  message: string
): ApiError => new ApiError(error.internalCode, message, error.statusCode);

const unmappedError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.UNMAPPED_ERROR, message);

const databaseConnectionError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.DB_CONNECTION_ERROR, message);

const databaseError: BuildApiErrorFunction = (message) => buildApiError(errors.DB_ERROR, message);

const subjectExistsError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.SUBJECT_EXISTS_ERROR, message);

const subjectNotFoundError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.SUBJECT_NOT_FOUND_ERROR, message);

const propertyNotFoundError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.PROPERTY_NOT_FOUND_ERROR, message);

const invalidSignatures: BuildApiErrorFunction = (message) =>
  buildApiError(errors.INVALID_SIGNATURES, message);

const olderEntryError: BuildApiErrorFunction = (message) =>
  buildApiError(errors.OLDER_ENTRY_ERROR, message);

export const ErrorFactory = {
  unmappedError,
  databaseConnectionError,
  databaseError,
  subjectExistsError,
  subjectNotFoundError,
  propertyNotFoundError,
  invalidSignatures,
  olderEntryError,
};
