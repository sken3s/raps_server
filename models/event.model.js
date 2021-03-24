const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  datetime: { type: Date, required: true },
  type: { type: Number, min:0,max:3 }, //0:fallen tree, 1:landslide, 2:flooding, 3:other
  drivingSide: { type: Boolean }, //0:colombo 1:matara
  severity: { type: Number, min:0, max:2}, //0:minor, 1:intermediate, 2:major
  kmPost: { type: Number, min:0, max:127},
  suburb: { type: Number, min:0, max:10},
  sessionToken:{type:String}
}, {
  timestamps: true,
});




const Event = mongoose.model('Event', eventSchema);

module.exports = Event;