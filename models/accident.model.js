const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accidentSchema = new Schema({
  datetime: { type: Date, required: true },
  driverAge: { type: Number},
  driverGender: { type: String },
  weather: { type: String },
  vehicleType: { type: String },
  vehicleYOM: { type: Number },
  licenseIssueDate: { type: Date },
  drivingSide: { type: String },
  severity: { type: String },
  reason: { type: String },
  kmPost: { type: Number },
  suburb: { type: String },
  operatedSpeed: { type: Number },
  sessionToken:{type:String},
  status:{type:String}  //status of accident: 'reported','eTeam dispatched','handled'
}, {
  timestamps: true,
});




const Accident = mongoose.model('Accident', accidentSchema);

module.exports = Accident;