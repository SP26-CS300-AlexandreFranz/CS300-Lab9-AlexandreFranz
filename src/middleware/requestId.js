const { randomUUID } = require("crypto");

function requestId(req, res, next) {
  const id = randomUUID();
  res.setHeader("X-Request-Id", id);
  req.id = id;
  next();
}

module.exports = { requestId };