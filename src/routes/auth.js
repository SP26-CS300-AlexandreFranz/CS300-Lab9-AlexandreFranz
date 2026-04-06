const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * @api {post} /api/auth/register Register
 * @apiName Register
 * @apiGroup Auth
 * @apiDescription Create a new account. Password is hashed with bcrypt (10 salt rounds) before storage.
 *
 * @apiBody {String} email User email (must be unique).
 * @apiBody {String} password Plaintext password (hashed server-side, never stored in plaintext).
 *
 * @apiSuccess (201) {Number} user.id New user id.
 * @apiSuccess (201) {String} user.email Registered email.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 201 Created
 *     {
 *       "user": { "id": 1, "email": "you@example.com" }
 *     }
 *
 * @apiError (400) {String} error Missing email or password field.
 * @apiErrorExample {json} Missing fields
 *     HTTP/1.1 400 Bad Request
 *     { "error": "email and password are required" }
 *
 * @apiError (409) {String} error Email already registered.
 * @apiErrorExample {json} Duplicate email
 *     HTTP/1.1 409 Conflict
 *     { "error": "Email already registered" }
 *
 * @apiError (500) {String} error Unexpected server error.
 * @apiErrorExample {json} Server error
 *     HTTP/1.1 500 Internal Server Error
 *     { "error": "Server error" }
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, passwordHash });
    return res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Verify email/password with bcrypt and return a signed JWT for protected routes.
 *
 * @apiBody {String} email Registered email address.
 * @apiBody {String} password Plaintext password to verify against the stored bcrypt hash.
 *
 * @apiSuccess (200) {String} token Signed JWT — send as Authorization: Bearer token on protected requests.
 * @apiSuccess (200) {Object} user
 * @apiSuccess (200) {Number} user.id
 * @apiSuccess (200) {String} user.email
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "<jwt>",
 *       "user": { "id": 1, "email": "demo@example.com" }
 *     }
 *
 * @apiError (400) {String} error Missing email or password field.
 * @apiErrorExample {json} Missing fields
 *     HTTP/1.1 400 Bad Request
 *     { "error": "email and password are required" }
 *
 * @apiError (401) {String} error Invalid credentials. Returned for both wrong email and wrong
 *   password (deliberately ambiguous to prevent user enumeration attacks).
 * @apiErrorExample {json} Invalid credentials
 *     HTTP/1.1 401 Unauthorized
 *     { "error": "Invalid credentials" }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
  return res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});

module.exports = { authRouter: router };