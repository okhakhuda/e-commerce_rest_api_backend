const sendResponse = (res, statusCode, payload = {}) => {
  return res.status(statusCode).json({
    status: 'success',
    code: statusCode,
    ...payload,
  });
};

export default sendResponse;
