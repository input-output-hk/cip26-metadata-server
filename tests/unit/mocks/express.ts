import { Request } from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mockedResponse = () => {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(true);
  response.sendStatus = jest.fn().mockResolvedValue(true);
  response.json = jest.fn().mockReturnValue(true);
  return response;
};

export const mockedRequest = (
  body?: Record<string, unknown>,
  parameters?: Record<string, unknown>
) => {
  return { body, params: parameters } as Request;
};

export const mockRequest = (body: any = {}) => ({
  body,
});

export const mockResponse = {
  send: jest.fn(),
  json: jest.fn(),
  status: jest.fn(() => mockResponse),
};
