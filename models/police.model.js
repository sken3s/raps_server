const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const policeSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, default:'' },
  password: { type: String, required: true },
  adminRights: { type: Boolean, required: true }, //1: admin, 0: user
  isDeleted:{type:Boolean, default:false} //whether user is deleted or not 
}, {
  timestamps: true,
});

//password hashing
policeSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};
policeSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
};


const Police = mongoose.model('Police', policeSchema);

module.exports = Police;