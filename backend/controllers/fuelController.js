const FuelLog = require('../models/FuelLog');

exports.getFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.find().populate('vehicleId').sort('-date');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });
    res.json({ message: 'Fuel log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
