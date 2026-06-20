const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  type: { type: String, default: 'Bus' },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'on-route', 'maintenance'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
