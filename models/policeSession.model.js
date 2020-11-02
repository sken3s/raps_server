const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const policeSessionSchema = new Schema({
  username: { type: String, default:''},
  timestamp: { type: Date, default:Date.now() },
  isDeleted:{type:Boolean, default:false} //if deleted, signed out
});

//password hashing
policeSessionSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
}
policeSessionSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
}


const PoliceSession = mongoose.model('PoliceSession', policeSessionSchema);

module.exports = PoliceSession;