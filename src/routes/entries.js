const express = require("express");
const { Entry } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * TODO (lab — apidoc): Complete @api documentation for GET /api/entries — include
 * @apiHeader {String} Authorization Bearer token, @apiSuccess body shape, and 401 cases.
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
