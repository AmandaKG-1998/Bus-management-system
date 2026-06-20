const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Schedule = require('../models/Schedule');
const FuelLog = require('../models/FuelLog');

exports.getStats = async (req, res) => {
  try {
    const totalRoutes = await Route.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: { $ne: 'maintenance' } });
    const totalDrivers = await Driver.countDocuments();
    const totalSchedules = await Schedule.countDocuments();

    const upcomingSchedules = await Schedule.find({ departureTime: { $gte: new Date() } })
      .sort('departureTime')
      .limit(5)
      .populate('routeId')
      .populate('vehicleId')
      .populate('driverId');

    // Fuel usage grouped by month, used for the dashboard chart
    const fuelByMonth = await FuelLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalLiters: { $sum: '$liters' },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalRoutes,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      totalSchedules,
      upcomingSchedules,
      fuelByMonth
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
