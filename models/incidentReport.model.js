const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IncidentReportSchema = new Schema({
  datetime: { type: Date, default:Date.now},
  isAccident:{type: Boolean}, //True: Accident, False:Event
  weather: { type: String },
  vehicleType: { type: String },
  drivingSide: { type: String },
  severity: { type: String },
  kmPost: { type: Number },
  suburb: { type: String },
  operatedSpeed: { type: Number },
  sessionToken:{type:String},
}, {
  timestamps: true,
});




const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);

module.exports = IncidentReport;