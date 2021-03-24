const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const publicHolidaySchema = new Schema({
  date: { type: Date, required: true,  unique: true},
  name: { type: String, required: true },
  sessionToken:{type:String}
}, {
  timestamps: true,
});




const PublicHoliday = mongoose.model('PublicHoliday', publicHolidaySchema);

module.exports = PublicHoliday;