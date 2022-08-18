export const mockRequest = (body) => ({
  body,
});

export const mockResponse = {
  status: jest.fn().mockReturnValue(true),
  sendStatus: jest.fn().mockResolvedValue(true),
  json: jest.fn().mockReturnValue(true),
};
