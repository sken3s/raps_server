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
  //derived
  day_cat: { type: Number }, //0,1
  hour_cat: { type: Number },//0:Free, 1:Rush, 2:Normal
  month_cat: { type: Number },//0:Peak, 1:Off-peak
  vision: { type: Number }, //0:Poor, 1:Glare, 2:Normal, 3:Blurred
  age_cat: { type: Number }, //0:Young, 1:Mid, 2:Older
  km_cat: { type: Number }, //0-5 : KM1-KM6
  //predictors
    drowsiness: { type: Boolean }, 
    enough_gap: { type: Boolean },
    animal_crossing_problem: { type: Boolean },
    vehicle_condition: { type: Boolean },
    roadSurface: { type: String }, //Dry/Wet
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