const { Router } = require("express");
const router = new Router();

const Event = require("../../models/event/model");
const User = require("../../models/user/model");
const Comment = require("../../models/comments/model");
const Ticket = require("../../models/ticket/model");
const { Op } = require("sequelize");

const auth = require("../../auth/middleware");

// CREATE NEW EVENT
router.post("/create", auth, (req, res, next) => {
  if (req.body) {
    if (
      req.body.name &&
      req.body.description &&
      req.body.logo &&
      req.body.eventDate
    ) {
      const { body } = req;
      if (!req.body.eventEndDate) {
        body.eventEndDate = body.eventDate;
      }
      Event.create({ ...body })
        .then(newEvent => res.json(newEvent))
        .catch(next);
    } else {
      res.status(400).send({
        message: "Please supply a valid event information"
      });
    }
  } else {
    res.status(400).send({
      message: "Please supply a valid event information"
    });
  }
});

// FIND ALL EVENTS
router.get("/allevents", (req, res, next) => {
  const limit = 9;
  const offset = req.query.offset || 0;

  Event.findAndCountAll({
    limit,
    offset,
    where: {
      eventDate: { [Op.gt]: new Date() }
    }
  })
    .then(events => {
      if (events.rows) {
        const { rows, count } = events;
        res.json({ data: rows, count: count });
      } else {
        res.status(404).send({
          message: "Sorry no Events found"
        });
      }
    })
    .catch(next);
});

// GET ONE EVENT
router.get("/:id", (req, res, next) => {
  const eventId = req.params.id;
  Event.findByPk(eventId, {
    include: [{ model: Ticket, include: [Comment, User] }]
  })
    .then(event => {
      if (event) {
        event.tickets.map(ticket => (ticket.user.password = ""));
        res.json(event);
      } else {
        res.status(404).send({
          message: "Sorry this event is not found"
        });
      }
    })
    .catch(next);
});

// CREATE NEW TICKET
router.post("/:id/ticket", auth, (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  if (req.body) {
    if (req.body.price && req.body.ticketDescription) {
      const { price, ticketDescription } = req.body;
      const image =
        req.body.image ||
        "https://static.thenounproject.com/png/340719-200.png";

      User.findByPk(userId, { include: [Ticket] }).then(user => {
        if (!user) {
          return res.status(400).send({
            message: "User Not Found"
          });
        }
        let risk = 0;
        if (user.ticketAmount === 0) {
          // CALCULATE RISK - if the ticket is the only ticket of the author, add 10%
          risk = 10;
          user.ticketAmount = user.ticketAmount + 1;
          user.save();
        } else if (user.ticketAmount === 1) {
          // IF USER HAD ONE TICKET BEFORE
          user.ticketAmount = user.ticketAmount + 1;
          user.save();

          // find previous ticket and update
          Ticket.findOne({ where: { userId: user.id } })
            .then(ticket => {
              ticket.risk = risk;
              ticket.save();
            })
            .catch(next);
        } else {
          user.ticketAmount = user.ticketAmount + 1;
          user.save();
        }

        // CHECK TIME AND MAKE RISK CORRECTION
        const currTime = new Date();
        const hoursNow = currTime.getHours();
        if (hoursNow > 9 && hoursNow < 17) {
          risk = risk - 10;
        } else {
          risk = risk + 10;
        }

        // CREATE A NEW TICKET
        Ticket.create({
          image,
          price,
          ticketDescription,
          eventId,
          userId,
          risk
        })
          .then(newTicket => {
            Ticket.findByPk(newTicket.id, { include: [User] }).then(
              foundTicket => {
                foundTicket.user.password = "";
                res.json(foundTicket);
              }
            );
          })
          .catch(next);
      });
    } else {
      res.status(400).send({
        message: "Please supply a valid ticket information"
      });
    }
  } else {
    res.status(400).send({
      message: "Please supply a valid ticket information"
    });
  }
});

module.exports = router;
