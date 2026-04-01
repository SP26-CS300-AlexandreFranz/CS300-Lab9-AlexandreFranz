const { app } = require("./app");
const { sequelize, User, Entry } = require("./models");
const bcrypt = require("bcrypt");

const PORT = Number(process.env.PORT) || 3000;
const SALT_ROUNDS = 10;

async function seed() {
  const count = await User.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);
  const alice = await User.create({
    email: "alice@lab.local",
    passwordHash,
  });
  const bob = await User.create({
    email: "bob@lab.local",
    passwordHash,
  });

  await Entry.bulkCreate([
    { title: "Alice first note", body: "Sequelize + SQLite demo", userId: alice.id },
    { title: "Bob draft", body: null, userId: bob.id },
    { title: "Shared lab", body: "Use JWT from /api/auth/login", userId: alice.id },
  ]);
}

async function main() {
  if (!process.env.JWT_SECRET) {
    console.warn("Warning: JWT_SECRET is not set; using insecure default for local demo only.");
    process.env.JWT_SECRET = "local-dev-only-change-me";
  }

  await sequelize.sync();
  await seed();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
