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

export const ErrorFactory = {
  unmappedError,
  databaseConnectionError,
  databaseError,
  subjectExistsError,
};
