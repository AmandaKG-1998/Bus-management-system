const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true },
  cost: { type: Number, default: 0 },
  notes: { type: String },
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
