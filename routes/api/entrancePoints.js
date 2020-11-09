const router = require("express").Router();
const haversine = require("haversine");
let EPoints = require("../../models/entrancePoints.model");

router.route("/nearEntrance").post((req, res) => {
  EPoints.find({ type: "ep" })
    .then((points) => {
      const coords = {
        latitude: parseFloat(req.body.lat),
        longitude: parseFloat(req.body.lng),
      };
      let entranceCoords, distance;
      for (const pointIndex in points) {
        entranceCoords = {
          latitude: parseFloat(points[pointIndex].lat),
          longitude: parseFloat(points[pointIndex].lng),
        };
        distance = haversine(coords, entranceCoords, { unit: "meter" });

        if (distance < 500) {
          return res.json(points[pointIndex].entrance);
        }
        return res.json("Not near any entrances");
      }
    })
    .catch((err) => res.json("ERROR" + err));
});

router.route("/nearDanger").post((req, res) => {
  EPoints.find({ type: "dp" })
    .then((points) => {
      const coords = {
        latitude: parseFloat(req.body.lat),
        longitude: parseFloat(req.body.lng),
      };
      let entranceCoords, distance;
      for (const pointIndex in points) {
        entranceCoords = {
          latitude: parseFloat(points[pointIndex].lat),
          longitude: parseFloat(points[pointIndex].lng),
        };
        distance = haversine(coords, entranceCoords, { unit: "meter" });

        if (distance < 500) {
          return res.json("WARNING");
        }
        return res.json("SAFE");
      }
    })
    .catch((err) => res.json("ERROR" + err));
});

router.route("/list").get((req, res) => {
  EPoints.find()
    .then((points) => res.json(points))
    .catch((err) => res.status(400).json("SERVER_ERROR"));
});

module.exports = router;
