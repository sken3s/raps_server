const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const eTeamSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    password: { type: String, required: true },
    availability: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

eTeamSchema.methods.generateHash = (pwd) =>
  bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);

eTeamSchema.methods.validPassword = (pwd) =>
  bcrypt.compareSync(pwd, this.password);

const ETeam = mongoose.model("ETeam", eTeamSchema);

module.exports = ETeam;
