const { Router } = require("express");
const router = new Router();

const User = require("../../models/user/model");
const Ticket = require("../../models/ticket/model");

const bcrypt = require("bcrypt");
const auth = require("../../auth/middleware");
const { toJWT, toData } = require("../../auth/jwt");

router.post("/login", (req, res, next) => {
  if (req.body) {
    if (req.body.username && req.body.password) {
      User.findOne({
        where: {
          username: req.body.username
        }
      })
        .then(entity => {
          if (!entity) {
            res.status(400).send({
              message: "User with that username does not exist"
            });
          } else if (bcrypt.compareSync(req.body.password, entity.password)) {
            res.send({
              jwt: toJWT({ userId: entity.id }),
              username: entity.username,
              id: entity.id
            });
          } else {
            res.status(400).send({
              message: "Password was incorrect"
            });
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).send({
            message: "Something went wrong"
          });
        });
    } else {
      res.status(400).send({
        message: "Please supply a valid username and password"
      });
    }
  } else {
    res.status(400).send({
      message: "Please supply a valid username and password"
    });
  }
});

router.post("/create", (req, res, next) => {
  if (req.body) {
    if (req.body.username && req.body.password) {
      const user = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      User.findOne({
        where: {
          username: req.body.username
        }
      }).then(foundUser => {
        if (!foundUser) {
          User.create(user)
            .then(newUser => {
              res.send({
                jwt: toJWT({ userId: newUser.id }),
                username: newUser.username,
                id: newUser.id
              });
            })
            .catch(next);
        } else {
          res.status(400).send({
            message: "User already exists"
          });
        }
      });
    } else {
      res.status(400).send({
        message: "Please supply a valid username and password"
      });
    }
  } else {
    res.status(400).send({
      message: "Please supply a valid username and password"
    });
  }
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  User.findByPk(id, { include: [Ticket] })
    .then(user => {
      if (user) {
        user.password = "";
        res.json(user);
      } else {
        res.status(404).send({
          message: `Sorry user with id: ${id} not found`
        });
      }
    })
    .catch(next);
});

router.get("/", (req, res, next) => {
  User.findAll()
    .then(users => {
      if (users) {
        users.map(user => (user.password = ""));
        res.json(users);
      } else {
        res.status(404).send({
          message: "Sorry no Users found"
        });
      }
    })
    .catch(next);
});

router.get("/secret-endpoint", auth, (req, res) => {
  res.send({
    message: `Thanks for visiting the secret endpoint ${req.user.username}.`
  });
});

module.exports = router;
