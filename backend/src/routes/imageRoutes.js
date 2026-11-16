import { Router } from 'express';
import { searchUnsplashImages } from '../controllers/imageController.js';

const router = Router();

router.get('/search', searchUnsplashImages);

export default router;
