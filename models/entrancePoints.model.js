const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrancePointSchema = new Schema(
  {
    type: { type: String },
    entrance: { type: String },
    lat: { type: String },
    lng: { type: String },
  },
  {
    collection: "entrancepoints",
  }
);

const EPoints = mongoose.model("EPoints", entrancePointSchema);

module.exports = EPoints;
