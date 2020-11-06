const router = require("express").Router();
let ETeam = require("../../models/eTeam.model");

router.route("/list").get((req, res) => {
  ETeam.find()
    .then((teams) => res.json(teams))
    .catch((err) => res.status(400).json("SERVER_ERROR"));
});

router.route("/signin").post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || username.length < 4) {
    return res.json("USERNAME_INVALID");
  }

  if (!password || password.length < 4) {
    return res.json("PASSWORD_INVALID");
  }

  ETeam.find({ username: username })
    .then((eteam) => res.json("Succesfully signed in"))
    .catch((err) => res.status(400).json("INVALID_USER"));
});
