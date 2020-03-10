const { Router } = require("express");
const router = new Router();

const Event = require("../../models/event/model");
const User = require("../../models/user/model");

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
      const userId = req.user.id;
      Event.create({ ...req.body, userId })
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
