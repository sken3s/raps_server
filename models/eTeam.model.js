const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const eTeamSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    password: { type: String, required: true },
    availability: { type: Boolean },
    contactNumber: { type: String, required: true },
    isDeleted: {type: Boolean, default:false},
    lat: { type: String },
    lng: { type: String }
  },
  {
    timestamps: true,
  }
);

  eTeamSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
  };
  eTeamSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
  };

const ETeam = mongoose.model("ETeam", eTeamSchema);

module.exports = ETeam;
