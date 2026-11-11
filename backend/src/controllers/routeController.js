import { Route } from '../models/Route.js';
import { NotFoundError } from '../utils/customErrors.js';

export async function getRoutes(req, res, next) {
  try {
    const routes = await Route.find({ isActive: true }).sort({ distanceKm: 1 });
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
    const route = await Route.findById(id);
    if (!route) {
      throw new NotFoundError(`Route ${id} not found.`);
    }
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
    res.status(201).json({
      success: true,
      message: 'Highway route added successfully',
      data: route,
    });
  } catch (error) {
    next(error);
  }
}
