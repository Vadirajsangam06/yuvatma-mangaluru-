import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerHandler, loginHandler } from './auth.controller';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, data: null, message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, registerHandler);
router.post('/login', authLimiter, loginHandler);

export default router;
