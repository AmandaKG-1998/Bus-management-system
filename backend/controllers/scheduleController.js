const Schedule = require('../models/Schedule');

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('routeId')
      .populate('vehicleId')
      .populate('driverId')
      .sort('departureTime');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('routeId').populate('vehicleId').populate('driverId');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checks whether the chosen vehicle or driver is already booked
// in a time window that overlaps with the requested departure/arrival time.
const findConflict = async (vehicleId, driverId, departureTime, arrivalTime, excludeId = null) => {
  const query = {
    $or: [{ vehicleId }, { driverId }],
    departureTime: { $lt: arrivalTime },
    arrivalTime: { $gt: departureTime }
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Schedule.findOne(query).populate('vehicleId').populate('driverId');
};

exports.createSchedule = async (req, res) => {
  try {
    const { routeId, vehicleId, driverId, departureTime, arrivalTime } = req.body;

    if (new Date(arrivalTime) <= new Date(departureTime)) {
      return res.status(400).json({ message: 'Arrival time must be after departure time' });
    }

    const conflict = await findConflict(vehicleId, driverId, departureTime, arrivalTime);
    if (conflict) {
      return res.status(409).json({
        message: 'Time conflict: the selected vehicle or driver is already booked during this time window'
      });
    }

    const schedule = await Schedule.create({ routeId, vehicleId, driverId, departureTime, arrivalTime });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const existing = await Schedule.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Schedule not found' });

    const vehicleId = req.body.vehicleId || existing.vehicleId;
    const driverId = req.body.driverId || existing.driverId;
    const departureTime = req.body.departureTime || existing.departureTime;
    const arrivalTime = req.body.arrivalTime || existing.arrivalTime;

    if (new Date(arrivalTime) <= new Date(departureTime)) {
      return res.status(400).json({ message: 'Arrival time must be after departure time' });
    }

    const conflict = await findConflict(vehicleId, driverId, departureTime, arrivalTime, req.params.id);
    if (conflict) {
      return res.status(409).json({
        message: 'Time conflict: the selected vehicle or driver is already booked during this time window'
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
