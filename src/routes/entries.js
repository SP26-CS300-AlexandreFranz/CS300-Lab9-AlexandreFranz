const express = require("express");
const { Entry } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * @api {get} /api/entries List Entries
 * @apiName ListEntries
 * @apiGroup Entries
 * @apiDescription Returns all journal entries for the authenticated user, sorted newest first.
 * Requires a valid JWT obtained from POST /api/auth/login.
 *
 * @apiHeader {String} Authorization Bearer token (format: Bearer <jwt>).
 * @apiHeaderExample {String} Authorization header
 *     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * @apiSuccess (200) {Object[]} entries List of entry objects.
 * @apiSuccess (200) {Number} entries.id Entry id.
 * @apiSuccess (200) {String} entries.title Entry title.
 * @apiSuccess (200) {String} entries.body Entry body text.
 * @apiSuccess (200) {String} entries.createdAt ISO 8601 creation timestamp.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "entries": [
 *         {
 *           "id": 1,
 *           "title": "First entry",
 *           "body": "Today was productive.",
 *           "createdAt": "2026-04-05T14:00:00.000Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (401) {String} error Authorization header is missing or malformed.
 * @apiErrorExample {json} Missing token
 *     HTTP/1.1 401 Unauthorized
 *     { "error": "Missing or invalid Authorization header" }
 *
 * @apiError (401) {String} error Token is expired or has been tampered with.
 * @apiErrorExample {json} Invalid token
 *     HTTP/1.1 401 Unauthorized
 *     { "error": "Invalid or expired token" }
 */
router.get("/", requireAuth, async (req, res) => {
  const rows = await Entry.findAll({
    where: { userId: req.userId },
    order: [["createdAt", "DESC"]],
    attributes: ["id", "title", "body", "createdAt"],
  });
  return res.json({ entries: rows });
});

module.exports = { entriesRouter: router };