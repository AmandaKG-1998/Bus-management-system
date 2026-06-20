const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
