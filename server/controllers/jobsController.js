import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../utils/errors.js';

export const createJob = async (req, res) => {
  const { company, position } = req.body;

  if (!company || !position) {
    throw new BadRequestError('Please provide company name and position (job role)');
  }

  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  req.body.createdBy = req.user.userId;
  
  // Set default applicationDate if not provided
  if (!req.body.applicationDate) {
    req.body.applicationDate = new Date();
  }

  const job = await Job.create(req.body);
  res.status(201).json({ job });
};

export const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job found with id : ${jobId}`);
  }

  // Check permissions
  if (job.createdBy.toString() !== req.user.userId) {
    throw new UnauthenticatedError('Not authorized to access this job');
  }

  await job.deleteOne();

  res.status(200).json({ msg: 'Success! Job removed.' });
};

export const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position } = req.body;

  if (!company || !position) {
    throw new BadRequestError('Please provide company name and position');
  }

  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job found with id : ${jobId}`);
  }

  // Check permissions
  if (job.createdBy.toString() !== req.user.userId) {
    throw new UnauthenticatedError('Not authorized to access this job');
  }

  const updatedJob = await Job.findOneAndUpdate(
    { _id: jobId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({ job: updatedJob });
};

export const getAllJobs = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const { status, jobType, workMode, search, sort } = req.query;

  // Query object mapping user ID
  const queryObject = {
    createdBy: req.user.userId,
  };

  // Add status filter
  if (status && status !== 'all') {
    queryObject.status = status;
  }

  // Add jobType filter
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  // Add workMode filter
  if (workMode && workMode !== 'all') {
    queryObject.workMode = workMode;
  }

  // Add search (case-insensitive on company or position)
  if (search) {
    queryObject.$or = [
      { company: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
  }

  // NO AWAIT yet (we chain search/sort/pagination)
  let result = Job.find(queryObject);

  // Sorting options
  if (sort === 'latest') {
    result = result.sort('-applicationDate -createdAt');
  } else if (sort === 'oldest') {
    result = result.sort('applicationDate createdAt');
  } else if (sort === 'a-z') {
    result = result.sort('company');
  } else if (sort === 'z-a') {
    result = result.sort('-company');
  } else {
    // Default sort latest
    result = result.sort('-applicationDate -createdAt');
  }

  // Pagination logic
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(200).json({ jobs, totalJobs, numOfPages });
};

export const showStats = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const userId = new mongoose.Types.ObjectId(req.user.userId);

  // Aggregate stats by status
  let stats = await Job.aggregate([
    { $match: { createdBy: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Format stats into a clean object with defaults for missing statuses
  const initialStats = {
    Applied: 0,
    OA: 0,
    Interview: 0,
    HR: 0,
    Offer: 0,
    Rejected: 0,
    Selected: 0,
  };

  const defaultStats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, initialStats);

  // Aggregate monthly applications for the last 6 months
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: {
          year: { $year: '$applicationDate' },
          month: { $month: '$applicationDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  // Map and reverse to get chronological order (Jan, Feb, Mar...)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let formattedMonthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = `${months[month - 1]} ${year}`;
      return { date, count };
    })
    .reverse();

  // If empty, supply mock placeholder trend data or keep empty
  if (formattedMonthlyApplications.length === 0) {
    // Generate empty/blank list or last 6 months with 0 counts so chart renders beautifully
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      formattedMonthlyApplications.push({
        date: `${months[d.getMonth()]} ${d.getFullYear()}`,
        count: 0,
      });
    }
  }

  res.status(200).json({ defaultStats, monthlyApplications: formattedMonthlyApplications });
};
