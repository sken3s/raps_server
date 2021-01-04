const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eTeamSessionSchema = new Schema({
  username: { type: String, default:''},
  timestamp: { type: Date, default:Date.now() },
  isDeleted:{type:Boolean, default:false} //if deleted, signed out
});

const ETeamSession = mongoose.model('ETeamSession', eTeamSessionSchema);

module.exports = ETeamSession;