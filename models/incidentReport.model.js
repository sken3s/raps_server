const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IncidentReportSchema = new Schema({
  datetime: { type: Date, default:Date.now},
  reporterName:{type:String},
  incidentType:{type:String},
  weather: { type: String },
  vehicleType: { type: String },
  drivingSide: { type: String },
  severity: { type: String },
  kmPost: { type: Number },
  suburb: { type: String },
  operatedSpeed: { type: Number },
  incidentDescription:{type:String},
  sessionToken:{type:String},
}, {
  timestamps: true,
});




const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);

module.exports = IncidentReport;