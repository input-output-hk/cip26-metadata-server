import { ApiError } from '../server/errors/error-factory';

export type BuildApiErrorFunction = (message: string) => ApiError;
