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

  ETeam.findOne({ username: username })
    .then((eteam) => {
      if (eteam.password === password) {
        return res.json(eteam);
      }

      return res.json("PASSWORD_INVALID");
    })
    .catch((err) => res.status(400).json("USER_INVALID"));
});

router.route("/:id").get((req, res) => {
  ETeam.findById(req.params.id)
    .then((eteam) => res.json(eteam))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/updateAvailability/:id").post((req, res) => {
  const availability = (req.body.availability === "true");

  if (typeof availability !== "boolean") {
    return res.json(typeof availability);
  }

  ETeam.findById(req.params.id)
    .then((eteam) => {
      eteam.availability = availability;

      eteam
        .save()
        .then(() => res.json("Availability updated"))
        .catch((err) => res.status(400).json("ERROR" + err));
    })
    .catch((err) => res.status(400).json("ERROR" + err));
});

module.exports = router;
