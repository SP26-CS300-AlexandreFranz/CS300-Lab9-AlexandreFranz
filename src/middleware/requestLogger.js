/**
 * Example middleware: logs method, path, and rough timing.
 * TODO (lab): add another middleware — e.g. rate limiting, request id header,
 * or a security header helper — and attach it in src/app.js after this one.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

module.exports = { requestLogger };
