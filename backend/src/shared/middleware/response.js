/**
 * Standard API response envelope.
 *
 * Success:  { success: true,  data: <payload>, meta: { requestId } }
 * Error:    { success: false, error: { code, message, details? }, meta: { requestId } }
 * Paginated:{ success: true,  data: <payload>, meta: { requestId, page, limit, total } }
 */

function sendSuccess(res, data, statusCode = 200, extra) {
  const body = { success: true, data };
  body.meta = { requestId: res.locals.requestId, ...extra };
  return res.status(statusCode).json(body);
}

function sendError(res, statusCode, code, message, details) {
  const body = { success: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  body.meta = { requestId: res.locals.requestId };
  return res.status(statusCode).json(body);
}

function sendPaginated(res, data, { page, limit, total }) {
  return sendSuccess(res, data, 200, {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
