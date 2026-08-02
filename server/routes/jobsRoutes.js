import express from 'express';
import { createJob, deleteJob, updateJob, getAllJobs, showStats } from '../controllers/jobsController.js';
import { checkResume } from '../controllers/resumeController.js';
import authenticateUser, { optionalAuth } from '../middleware/auth.js';
import { uploadResumeMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(authenticateUser, createJob)
  .get(authenticateUser, getAllJobs);

router.route('/stats')
  .get(authenticateUser, showStats);

router.route('/check-resume')
  .post(optionalAuth, uploadResumeMiddleware, checkResume);

router.route('/:id')
  .patch(authenticateUser, updateJob)
  .delete(authenticateUser, deleteJob);

export default router;
