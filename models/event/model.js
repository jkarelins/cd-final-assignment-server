const Sequelize = require("sequelize");
const db = require("../../db");

const Event = db.define(
  "event",
  {
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    logo: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    eventDate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    }
  },
  {
    // timestamps: false,
    tableName: "events"
  }
);

module.exports = Event;
