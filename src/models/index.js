const { sequelize } = require("../config/database");
const { defineUser } = require("./User");
const { defineEntry } = require("./Entry");

const User = defineUser(sequelize);
const Entry = defineEntry(sequelize);

User.hasMany(Entry, { foreignKey: "userId", as: "entries" });
Entry.belongsTo(User, { foreignKey: "userId", as: "author" });

module.exports = { sequelize, User, Entry };
