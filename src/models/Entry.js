const { DataTypes } = require("sequelize");

function defineEntry(sequelize) {
  return sequelize.define(
    "Entry",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
    },
    {
      tableName: "entries",
      timestamps: true,
    }
  );
}

module.exports = { defineEntry };
