const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  username: { type: String, required: true }, //driver username
  regno: { type: String, default:'' }, //registration number
  type: { type: String, default:'' }, //vehicle type
  yom: { type: String, default:'' }, //vehicle year of manufacture
}, {
  timestamps: true,
});




const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;