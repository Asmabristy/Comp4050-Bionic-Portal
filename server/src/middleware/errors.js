export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Without this, an error thrown in an async route never reaches errorHandler. */
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error("[error]", err);
  res.status(status).json({
    error: status >= 500 ? "Something broke on our end. Try again." : err.message,
  });
}
