import { Bus } from '../models/Bus.js';
import { NotFoundError } from '../utils/customErrors.js';

export async function getBuses(req, res, next) {
  try {
    const { origin, destination, busType, minPrice, maxPrice, operator } = req.query;

    const query = { isActive: true };

    if (origin) {
      query.origin = { $regex: new RegExp(String(origin), 'i') };
    }
    if (destination) {
      query.destination = { $regex: new RegExp(String(destination), 'i') };
    }
    if (busType) {
      query.busType = { $regex: new RegExp(String(busType), 'i') };
    }
    if (operator) {
      query.operator = { $regex: new RegExp(String(operator), 'i') };
    }
    if (minPrice || maxPrice) {
      query.fare = {};
      if (minPrice) query.fare.$gte = Number(minPrice);
      if (maxPrice) query.fare.$lte = Number(maxPrice);
    }

    let buses = await Bus.find(query).sort({ fare: 1 });

    // Fallback: If no exact origin/destination match, return all active buses to support demo exploration
    if (buses.length === 0 && (origin || destination)) {
      buses = await Bus.find({ isActive: true }).sort({ fare: 1 });
    }

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBusById(req, res, next) {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id);

    if (!bus) {
      throw new NotFoundError(`Bus with ID ${id} not found.`);
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBus(req, res, next) {
  try {
    const bus = await Bus.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Bus successfully added to schedule',
      data: bus,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBus(req, res, next) {
  try {
    const { id } = req.params;
    const bus = await Bus.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!bus) {
      throw new NotFoundError(`Bus with ID ${id} not found.`);
    }

    res.status(200).json({
      success: true,
      message: 'Bus details updated successfully',
      data: bus,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBus(req, res, next) {
  try {
    const { id } = req.params;
    const bus = await Bus.findByIdAndDelete(id);

    if (!bus) {
      throw new NotFoundError(`Bus with ID ${id} not found.`);
    }

    res.status(200).json({
      success: true,
      message: `Bus ${bus.busNumber} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
