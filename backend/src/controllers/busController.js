import { Bus } from '../models/Bus.js';
import { NotFoundError } from '../utils/customErrors.js';
import { normalizeYatraBus } from '../utils/yatraFleet.js';
import { getOrSet, invalidate } from '../config/redis.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getBuses(req, res, next) {
  try {
    const { origin, destination, busType, minPrice, maxPrice } = req.query;

    const query = { isActive: true };

    if (origin) {
      query.origin = { $regex: new RegExp(escapeRegex(origin), 'i') };
    }
    if (destination) {
      query.destination = { $regex: new RegExp(escapeRegex(destination), 'i') };
    }
    if (busType) {
      query.busType = { $regex: new RegExp(escapeRegex(busType), 'i') };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.fare = {};
      if (minPrice !== undefined) query.fare.$gte = minPrice;
      if (maxPrice !== undefined) query.fare.$lte = maxPrice;
    }

    const buses = await Bus.find(query).sort({ fare: 1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses.map(normalizeYatraBus),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBusById(req, res, next) {
  try {
    const { id } = req.params;
    const busData = await getOrSet(`bus:${id}`, 300, async () => {
      const bus = await Bus.findById(id);
      if (!bus) {
        throw new NotFoundError(`Bus with ID ${id} not found.`);
      }
      return normalizeYatraBus(bus);
    });

    res.status(200).json({
      success: true,
      data: busData,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBus(req, res, next) {
  try {
    const bus = await Bus.create(normalizeYatraBus(req.body));
    await invalidate('bus:');
    await invalidate('trips:');

    res.status(201).json({
      success: true,
      message: 'Bus successfully added to schedule',
      data: normalizeYatraBus(bus),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBus(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, operator: 'YatraBus' };
    if (updates.busName !== undefined) {
      updates.busName = normalizeYatraBus(updates).busName;
    }
    const bus = await Bus.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!bus) {
      throw new NotFoundError(`Bus with ID ${id} not found.`);
    }

    await invalidate('bus:');
    await invalidate('trips:');

    res.status(200).json({
      success: true,
      message: 'Bus details updated successfully',
      data: normalizeYatraBus(bus),
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

    await invalidate('bus:');
    await invalidate('trips:');

    res.status(200).json({
      success: true,
      message: `Bus ${bus.busNumber} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
