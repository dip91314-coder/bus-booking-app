import { Destination } from '../models/Destination.js';
import { NotFoundError } from '../utils/customErrors.js';
import { getOrSet, invalidate } from '../config/redis.js';

export async function getDestinations(req, res, next) {
  try {
    const { search, state, tag } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }
    if (tag && tag !== 'All') {
      query.tag = tag;
    }

    const cacheKey = `destinations:${JSON.stringify(query)}`;
    const destinations = await getOrSet(
      cacheKey,
      600,
      async () => await Destination.find(query).sort({ name: 1 })
    );

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDestinationById(req, res, next) {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);
    if (!destination) {
      throw new NotFoundError('Destination not found');
    }
    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDestination(req, res, next) {
  try {
    const destination = await Destination.create(req.body);
    await invalidate('destinations:');
    res.status(201).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDestination(req, res, next) {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!destination) {
      throw new NotFoundError('Destination not found');
    }
    await invalidate('destinations:');
    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDestination(req, res, next) {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      throw new NotFoundError('Destination not found');
    }
    await invalidate('destinations:');
    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
