const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IncidentReportSchema = new Schema({
  datetime: { type: Date, default:Date.now},
  isAccident:{type: Boolean}, //True: Accident, False:Event
  drivingSide: { type: Boolean }, //0:cmbtomatara, 1:mataratocmb
  kmPost: { type: Number, min:0, max:127},
  status: { type: Number, min:0,max:2},  //status of accident: 1:reported,2:eTeam dispatched,3:handled },
  lat: { type: String },
  lng: { type: String },
  sessionToken:{type:String},
  driverUsername:{type:String}, //driver who reported
  eTeamUsername:{type:String} //eTeam who is assigned
}, {
  timestamps: true,
});




const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);

module.exports = IncidentReport;