import { Request } from 'express';

import { CustomRequest } from '../../../src/server/middlewares/metadata';

export const mockRequest = (
  body: Record<string, unknown> = {},
  parameters: Record<string, unknown> = {}
) => {
  return { body, params: parameters } as Request;
};

export const mockCustomRequest = (
  object: Record<string, unknown> = {},
  parameters: Record<string, unknown> = {}
) => {
  const request = { params: parameters } as CustomRequest;
  request.object = object;
  return request;
};

export const mockResponse = {
  send: jest.fn(),
  sendStatus: jest.fn(),
  json: jest.fn(),
  status: jest.fn(() => mockResponse),
};
