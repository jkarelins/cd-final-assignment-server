const { Router } = require("express");
const router = new Router();

const User = require("../../models/user/model");

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
              username: entity.username
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
            .then(newUser => res.json(newUser))
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
