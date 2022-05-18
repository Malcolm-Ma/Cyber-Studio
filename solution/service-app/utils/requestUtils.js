/**
 * @file utils for http request
 * @author Mingze Ma
 */

/**
 * Successful response format generator
 * @param res res callback
 * @param options options
 */
const buildSuccessResponse = (res, options = {}) => {
  const { message = 'success', data = {} } = options;

  res.json({
    status: 0,
    message,
    data,
  });
};

const buildErrorResponse = (res, options = {}) => {
  const { message = 'error', error = new Error(), status = 500 } = options;

  res.status(status).json({
    status: 1,
    message,
    error: error.toString(),
  });
};

module.exports = {
  buildSuccessResponse,
  buildErrorResponse,
};
