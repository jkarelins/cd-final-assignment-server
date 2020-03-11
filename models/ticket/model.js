const Sequelize = require("sequelize");
const db = require("../../db");
const User = require("../user/model");
const Event = require("../event/model");

const Ticket = db.define(
  "ticket",
  {
    image: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ticketDescription: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    risk: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "tickets"
  }
);

Ticket.belongsTo(User);
User.hasMany(Ticket);

Ticket.belongsTo(Event);
Event.hasMany(Ticket);

module.exports = Ticket;
