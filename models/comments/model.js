const Sequelize = require("sequelize");
const db = require("../../db");
const User = require("../user/model");
const Ticket = require("../ticket/model");

const Comment = db.define(
  "comment",
  {
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  },
  {
    tableName: "comments"
  }
);

Comment.belongsTo(User);
User.hasMany(Comment);

Comment.belongsTo(Ticket);
Ticket.hasMany(Comment);

module.exports = Comment;
