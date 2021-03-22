const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accidentSchema = new Schema({
  datetime: { type: Date, required: true },
  driverAge: { type: Number, min: 17, max: 76},
  driverGender: { type: Boolean }, //0:male, 1:female
  weather: { type: Boolean }, //0:clear, 1:rain
  roadSurface: { type: Boolean }, //0:Dry, 1:Wet
  vehicleType: { type: Number, min: 0, max: 2 }, //0:car, 1:hv, 2:dualpurpose
  vehicleYOM: { type: Number },
  licenseIssueDate: { type: Date },
  drivingSide: { type: Boolean }, //0:cmbtomatara, 1:mataratocmb
  severity: { type: Number, min:0, max:2}, //0:property damage, 1:injury, 2:mortality
  reason: { type: Number, min:0, max:5}, //0:Animal Crossing, 1:Vehicle issue, 2:Speed, 3:Tailgating, 4:Sleep,5:Slipping  
  vehicle_condition: { type: Boolean },
  kmPost: { type: Number, min:0, max:127},
  suburb: { type: Number, min:0, max:10},
  operatedSpeed: { type: Number },
  sessionToken:{type:String},
  isDeleted:{type:Boolean},
  //derived
  day_cat: { type: Number,min:0,max:2 }, //0:weekday,1:weekend,2:publicholiday
  hour_cat: { type: Number, min:0, max:2 },//0:Free, 1:Rush, 2:Normal
  month_cat: { type: Boolean },//0:Peak, 1:Off-peak
  vision: { type: Number, min:0, max:3 }, //0:Poor, 1:Glare, 2:Normal, 3:Blurred
  age_cat: { type: Number, min:0, max:2 }, //0:Young, 1:Mid, 2:Older
  km_cat: { type: Number, min:0, max:5 }, //0-5 : KM1-KM6
  drowsiness: { type: Boolean }, 
  enough_gap: { type: Boolean },
  animal_crossing_problem: { type: Boolean }
}, {
  timestamps: true,
});




const Accident = mongoose.model('Accident', accidentSchema);

module.exports = Accident;