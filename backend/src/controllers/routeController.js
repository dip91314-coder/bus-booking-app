import { Route } from '../models/Route.js';
import { NotFoundError } from '../utils/customErrors.js';
import { getOrSet, invalidate } from '../config/redis.js';

export async function getRoutes(req, res, next) {
  try {
    const routes = await getOrSet('routes:all', 600, async () => {
      return Route.find({ isActive: true }).sort({ distanceKm: 1 });
    });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRouteById(req, res, next) {
  try {
    const { id } = req.params;
    const route = await getOrSet(`routes:${id}`, 600, async () => {
      const doc = await Route.findById(id);
      if (!doc) {
        throw new NotFoundError(`Route ${id} not found.`);
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRoute(req, res, next) {
  try {
    const route = await Route.create(req.body);
    await invalidate('routes:');
    await invalidate('trips:');
    res.status(201).json({
      success: true,
      message: 'Highway route added successfully',
      data: route,
    });
  } catch (error) {
    next(error);
  }
}
