import { Request } from 'express';

export const mockRequest = (
  body: Record<string, unknown> = {},
  parameters: Record<string, unknown> = {}
) => {
  return { body, params: parameters } as Request;
};

export const mockResponse = {
  send: jest.fn(),
  sendStatus: jest.fn(),
  json: jest.fn(),
  status: jest.fn(() => mockResponse),
};
