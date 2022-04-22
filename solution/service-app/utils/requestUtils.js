/**
 * @file utils for http request
 * @author Mingze Ma
 */

const buildSuccessResponse = (res, options = {}) => {
  const { message = 'success', data = {} } = options;

  res.json({
    status: 0,
    message,
    data,
  });
};

module.exports = {
  buildSuccessResponse,
};
