const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const driverSessionSchema = new Schema({
  username: { type: String, default:''},
  timestamp: { type: Date, default:Date.now() },
  isDeleted:{type:Boolean, default:false}, //if deleted, signed out
  isBlocked:{type:Boolean, default:false} //block from reporting incidents
});

const DriverSession = mongoose.model('DriverSession', driverSessionSchema);

module.exports = DriverSession;