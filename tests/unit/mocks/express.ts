import { Request } from 'express';

import { CustomRequest } from '../../../src/server/middlewares/metadata';

export const mockRequest = (
  body: Record<string, unknown> = {},
  parameters: Record<string, unknown> = {}
) => ({ body, params: parameters } as Request);

export const mockCustomRequest = (
  object: Record<string, unknown> = {},
  parameters: Record<string, unknown> = {},
  body?: Record<string, unknown>
) => ({ params: parameters, metadataObject: object, body } as CustomRequest);

export const mockResponse = {
  send: jest.fn(),
  sendStatus: jest.fn(),
  json: jest.fn(),
  status: jest.fn(() => mockResponse),
};
