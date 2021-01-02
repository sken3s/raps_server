const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const policeSessionSchema = new Schema({
  username: { type: String, default:''},
  adminRights : {type:Boolean, default:0},
  timestamp: { type: Date, default:Date.now() },
  isDeleted:{type:Boolean, default:false} //if deleted, signed out
});

const PoliceSession = mongoose.model('PoliceSession', policeSessionSchema);

module.exports = PoliceSession;