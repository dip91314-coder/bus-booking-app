import { TripPackage } from '../models/TripPackage.js';
import { getOrSet, invalidate } from '../config/redis.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getPackages(req, res, next) {
  try {
    const { category, departureCity, destinationCity, maxPrice } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (departureCity) filter.departureCity = new RegExp(`^${departureCity}$`, 'i');
    if (destinationCity) filter.destinationCity = new RegExp(`^${destinationCity}$`, 'i');
    if (maxPrice && !isNaN(Number(maxPrice))) filter.pricePerPerson = { $lte: Number(maxPrice) };

    const cacheKey = `packages:${category || 'all'}:${departureCity || 'all'}:${destinationCity || 'all'}:${maxPrice || 'all'}`;

    const packages = await getOrSet(cacheKey, 300, async () => {
      return TripPackage.find(filter).sort({ featured: -1, createdAt: -1 });
    });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackageBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const cacheKey = `package:slug:${slug}`;

    const pkg = await getOrSet(cacheKey, 300, async () => {
      return TripPackage.findOne({ slug: slug.toLowerCase(), isActive: true });
    });

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Trip package not found.' });
    }

    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPackages(req, res, next) {
  try {
    const packages = await TripPackage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPackage(req, res, next) {
  try {
    const pkg = await TripPackage.create(req.body);
    await invalidate('packages:');

    await AuditLog.create({
      adminId: req.user?.userId || null,
      adminEmail: req.user?.email || 'admin@yatrabus.com',
      action: 'CREATE_PACKAGE',
      targetEntity: 'TripPackage',
      targetId: pkg._id.toString(),
      summary: `Created tour package ${pkg.title} (${pkg.category})`,
      diff: req.body,
      ipAddress: req.ip || '',
    }).catch(() => {});

    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
}

export async function updatePackage(req, res, next) {
  try {
    const pkg = await TripPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Tour package not found.' });
    }

    await invalidate('packages:');

    await AuditLog.create({
      adminId: req.user?.userId || null,
      adminEmail: req.user?.email || 'admin@yatrabus.com',
      action: 'UPDATE_PACKAGE',
      targetEntity: 'TripPackage',
      targetId: pkg._id.toString(),
      summary: `Updated tour package ${pkg.title}`,
      diff: req.body,
      ipAddress: req.ip || '',
    }).catch(() => {});

    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
}

export async function deletePackage(req, res, next) {
  try {
    const pkg = await TripPackage.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Tour package not found.' });
    }

    await invalidate('packages:');

    await AuditLog.create({
      adminId: req.user?.userId || null,
      adminEmail: req.user?.email || 'admin@yatrabus.com',
      action: 'DELETE_PACKAGE',
      targetEntity: 'TripPackage',
      targetId: pkg._id.toString(),
      summary: `Deleted tour package ${pkg.title}`,
      ipAddress: req.ip || '',
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Package deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
