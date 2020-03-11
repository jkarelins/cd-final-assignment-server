const { Router } = require("express");
const router = new Router();

const Ticket = require("../../models/ticket/model");
const User = require("../../models/user/model");
const Event = require("../../models/event/model");
const auth = require("../../auth/middleware");

router.get("/:id", (req, res, next) => {
  const ticketId = req.params.id;
  Ticket.findByPk(ticketId, { include: [User, Event] })
    .then(ticket => {
      if (ticket) {
        ticket.user.password = "";
        res.json(ticket);
      } else {
        res.status(404).send({
          message: "Sorry this ticket is not found"
        });
      }
    })
    .catch(next);
});

module.exports = router;
