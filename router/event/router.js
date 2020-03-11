const { Router } = require("express");
const router = new Router();

const Event = require("../../models/event/model");
const User = require("../../models/user/model");
const Ticket = require("../../models/ticket/model");

const auth = require("../../auth/middleware");

// Create a new event
router.post("/create", auth, (req, res, next) => {
  if (req.body) {
    if (
      req.body.name &&
      req.body.description &&
      req.body.logo &&
      req.body.eventDate
    ) {
      Event.create({ ...req.body })
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

// Edit event DO NOT USE IT !!!
// router.put("/:id", auth, (req, res, next) => {
//   if (req.body && req.params.id) {
//     if (
//       req.body.name &&
//       req.body.description &&
//       req.body.logo &&
//       req.body.eventDate
//     ) {
//       const eventId = req.params.id;
//       Event.findByPk(eventId)
//         .then(async event => {
//           const updatedEvent = await event.update(req.body);
//           await updatedEvent.save();
//           res.json(updatedEvent);
//         })
//         .catch(next);
//     } else {
//       res.status(400).send({
//         message: "Please supply a valid event information"
//       });
//     }
//   } else {
//     res.status(400).send({
//       message: "Please supply a valid event information"
//     });
//   }
// });

// Show single event
router.get("/:id", (req, res, next) => {
  const eventId = req.params.id;
  Event.findByPk(eventId, { include: [Ticket] })
    .then(event => {
      if (event) {
        res.json(event);
      } else {
        res.status(404).send({
          message: "Sorry this event is not found"
        });
      }
    })
    .catch(next);
});

// Create NEW ticket
router.post("/:id/ticket", auth, (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  if (req.body) {
    if (req.body.price && req.body.ticketDescription) {
      const { price, ticketDescription } = req.body;
      const image =
        req.body.image ||
        "https://static.thenounproject.com/png/340719-200.png";

      Ticket.create({ image, price, ticketDescription, eventId, userId })
        .then(newTicket => res.json(newTicket))
        .catch(err => {
          console.log(err);
          return next;
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

router.get("/", (req, res, next) => {
  Event.findAll()
    .then(events => {
      if (events) {
        res.json(events);
      } else {
        res.status(404).send({
          message: "Sorry no Events found"
        });
      }
    })
    .catch(next);
});

module.exports = router;
