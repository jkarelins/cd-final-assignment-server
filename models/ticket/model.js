const Sequelize = require("sequelize");
const db = require("../../db");
const User = require("../user/model");

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
      type: Sequelize.DATEONLY,
      allowNull: false
    }
  },
  {
    tableName: "tickets"
  }
);

Ticket.hasOne(User);
User.hasMany(Ticket);

module.exports = Ticket;
