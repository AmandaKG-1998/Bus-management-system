const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  liters: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
