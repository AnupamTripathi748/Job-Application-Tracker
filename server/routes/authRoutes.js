import express from 'express';
import {
  register,
  login,
  googleAuth,
  updateUser,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  uploadResume,
  deleteResume,
} from '../controllers/authController.js';
import authenticateUser from '../middleware/auth.js';
import { uploadResumeMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes using JWT authentication
router.get('/current-user', authenticateUser, getCurrentUser);
router.patch('/updateUser', authenticateUser, updateUser);
router.post('/upload-resume', authenticateUser, uploadResumeMiddleware, uploadResume);
router.delete('/delete-resume', authenticateUser, deleteResume);

export default router;
