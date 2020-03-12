const { Router } = require("express");
const router = new Router();

const Ticket = require("../../models/ticket/model");
const User = require("../../models/user/model");
const Event = require("../../models/event/model");
const Comment = require("../../models/comments/model");
const auth = require("../../auth/middleware");

router.get("/:id", (req, res, next) => {
  const ticketId = req.params.id;
  Ticket.findByPk(ticketId, {
    include: [User, Event, { model: Comment, include: [User] }]
  })
    .then(ticket => {
      if (ticket) {
        ticket.user.password = "";
        ticket.comments.map(comment => (comment.user.password = ""));
        Event.findByPk(ticket.event.id, { include: [Ticket] })
          .then(event => {
            const result = {
              ticket,
              restTickets: event.tickets
            };
            res.json(result);
          })
          .catch(next);
      } else {
        res.status(404).send({
          message: "Sorry this ticket is not found"
        });
      }
    })
    .catch(next);
});

router.post("/:id", auth, (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  if (req.body) {
    if (req.body.price && req.body.ticketDescription) {
      const { price, ticketDescription } = req.body;
      const image =
        req.body.image ||
        "https://static.thenounproject.com/png/340719-200.png";

      Ticket.findByPk(ticketId)
        .then(ticket => {
          if (ticket.userId === userId) {
            ticket
              .update({
                price,
                ticketDescription,
                image
              })
              .then(updTicket => res.json(updTicket));
          } else {
            res.status(400).send({
              message: "Sorry, You are not the owner of this ticket"
            });
          }
        })
        .catch(next);
    }
  } else {
    res.status(400).send({
      message: "Please supply a valid ticket information"
    });
  }
});

router.post("/:id/comment", auth, (req, res, next) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  if (req.body) {
    if (req.body.text) {
      Comment.create({ text: req.body.text, ticketId, userId })
        .then(newComment => {
          res.json(newComment);
        })
        .catch(next);
    } else {
      res.status(400).send({
        message: "Please, provide valid comment information"
      });
    }
  } else {
    res.status(400).send({
      message: "Please, provide valid comment information"
    });
  }
});

module.exports = router;
