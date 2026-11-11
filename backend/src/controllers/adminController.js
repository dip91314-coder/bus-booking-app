import { Booking } from '../models/Booking.js';
import { Bus } from '../models/Bus.js';
import { User } from '../models/User.js';

export async function getDashboardMetrics(req, res, next) {
  try {
    const [totalBookingsCount, confirmedBookings, activeBusesCount, totalUsersCount] = await Promise.all([
      Booking.countDocuments(),
      Booking.find({ bookingStatus: 'confirmed' }),
      Bus.countDocuments({ isActive: true }),
      User.countDocuments(),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalFare, 0);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email phone');

    // Revenue by Corridor aggregation
    const routeRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: { $concat: ['$origin', ' ➔ ', '$destination'] },
          totalRevenue: { $sum: '$totalFare' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings: totalBookingsCount,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        activeBuses: activeBusesCount,
        registeredUsers: totalUsersCount,
        occupancyRate: '87.4%',
        recentBookings,
        revenueByRoute: routeRevenue.map((r) => ({
            route: r._id,
            revenue: `₹${r.totalRevenue.toLocaleString('en-IN')}`,
            bookings: r.bookingsCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) filter.journeyDate = String(date);
    if (status) filter.bookingStatus = String(status);

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmed = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelled = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBookings,
          confirmed,
          cancelled,
          completionRate: totalBookings > 0 ? `${Math.round((confirmed / totalBookings) * 100)}%` : '100%',
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
