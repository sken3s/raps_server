const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  datetime: { type: Date, required: true },
  type: { type: String },
  drivingSide: { type: String },
  severity: { type: String },
  kmPost: { type: Number },
  suburb: { type: String },
  sessionToken:{type:String},
  status:{type:String} //status of event: 'reported','eTeam dispatched','handled'
}, {
  timestamps: true,
});




const Event = mongoose.model('Event', eventSchema);

module.exports = Event;