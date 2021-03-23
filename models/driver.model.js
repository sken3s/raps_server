const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, default:'' },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: Boolean, required: true }, //0:male, 1:female
  licenseIssueDate: { type: Date, required: true },
  isDeleted:{type:Boolean, default:false}, //whether user is deleted or not 
  isBlocked:{type:Boolean, default:false} //block from reporting incidents
}, {
  timestamps: true,
});

//password hashing
driverSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};
driverSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.password);
};


const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;