import User from '../models/User.js';
import { BadRequestError, UnauthenticatedError } from '../utils/errors.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Helper to generate 6-digit OTP string
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to construct clear email notices when Resend or demo modes fall back
const getEmailNotice = (emailResult, email) => {
  if (emailResult.mode === 'resend') {
    return undefined; // Live email sent successfully!
  }
  if (emailResult.mode === 'resend_restriction') {
    return `Resend free tier (onboarding@resend.dev) can only send live emails to the account owner (anupamtripathi74890@gmail.com). For testing with ${email}, your code is:`;
  }
  if (emailResult.mode === 'demo') {
    return 'RESEND_API_KEY is not configured in environment. Demonstration code:';
  }
  return `Email sending fallback (${emailResult.error || 'unknown issue'}). Testing code:`;
};

const getUserResponseData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  location: user.location,
  isVerified: user.isVerified ?? true,
  resumeUrl: user.resumeUrl || '',
  resumePublicId: user.resumePublicId || '',
  resumeOriginalName: user.resumeOriginalName || '',
});

export const register = async (req, res) => {
  const { name, email, password, location } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide all values (name, email, password)');
  }

  // Check if email already in use
  const normalizedEmail = email.toLowerCase().trim();
  const userAlreadyExists = await User.findOne({ email: normalizedEmail });
  
  if (userAlreadyExists) {
    throw new BadRequestError('Email already in use');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    location: location || 'Remote',
    isVerified: true,
  });

  const token = user.createJWT();

  res.status(201).json({
    msg: 'Registration successful!',
    user: getUserResponseData(user),
    token,
    location: user.location,
  });
};

export const verifyEmail = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.isVerified = true;
    await user.save();
    const token = user.createJWT();
    return res.status(200).json({
      msg: 'Email address verified successfully!',
      user: getUserResponseData(user),
      token,
      location: user.location,
    });
  }

  res.status(200).json({ msg: 'Email verification complete' });
};

export const resendOTP = async (req, res) => {
  res.status(200).json({ msg: 'Email verification is disabled.' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  // Find user and explicitly select password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  if (user.password) {
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials');
    }
  } else {
    // If created via Google SSO and doesn't have password set
    throw new BadRequestError('Please sign in using Sign in with Google');
  }

  const token = user.createJWT();
  
  res.status(200).json({
    user: getUserResponseData(user),
    token,
    location: user.location,
  });
};

export const googleAuth = async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email) {
    throw new BadRequestError('Email is required for Google Sign-In');
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Create new user automatically via Google
    const displayName = name || normalizedEmail.split('@')[0];
    user = await User.create({
      name: displayName,
      email: normalizedEmail,
      googleId: googleId || '',
      isVerified: true,
      location: 'Remote',
    });
  } else {
    // Update googleId if not present
    if (googleId && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  }

  const token = user.createJWT();

  res.status(200).json({
    msg: 'Google authentication successful',
    user: getUserResponseData(user),
    token,
    location: user.location,
  });
};

export const updateUser = async (req, res) => {
  const { email, name, location } = req.body;

  if (!email || !name || !location) {
    throw new BadRequestError('Please provide all values (email, name, location)');
  }

  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  const normalizedEmail = email.toLowerCase().trim();
  // Check if updating email to one that belongs to another user
  if (normalizedEmail !== user.email.toLowerCase()) {
    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      throw new BadRequestError('Email already in use');
    }
  }

  user.email = normalizedEmail;
  user.name = name;
  user.location = location;

  await user.save();

  const token = user.createJWT();

  res.status(200).json({
    user: getUserResponseData(user),
    token,
    location: user.location,
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Please provide email address');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new BadRequestError('No account found with this email address');
  }

  const otp = generateOTP();
  user.passwordResetOTP = otp;
  user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  const emailResult = await sendPasswordResetEmail({
    email: normalizedEmail,
    name: user.name,
    otp,
  });

  res.status(200).json({
    msg: 'A 6-digit password reset code has been sent to your email address.',
    email: normalizedEmail,
    devOTP: emailResult.mode !== 'resend' ? otp : undefined,
    emailNotice: getEmailNotice(emailResult, normalizedEmail),
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new BadRequestError('Please provide email, reset code, and new password');
  }

  if (newPassword.length < 6) {
    throw new BadRequestError('New password must be at least 6 characters');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetOTP +passwordResetOTPExpires');

  if (!user) {
    throw new BadRequestError('User account not found');
  }

  if (!user.passwordResetOTP || user.passwordResetOTP !== otp.toString().trim()) {
    throw new BadRequestError('Invalid reset code. Please check your code and try again.');
  }

  if (!user.passwordResetOTPExpires || user.passwordResetOTPExpires < new Date()) {
    throw new BadRequestError('Reset code has expired. Please request a new password reset.');
  }

  // Update password and clear reset fields
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  
  // Also verify user if they were previously unverified
  if (!user.isVerified) {
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
  }

  await user.save();

  res.status(200).json({
    msg: 'Password has been reset successfully! You can now log in with your new password.',
  });
};

export const getCurrentUser = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  res.status(200).json({
    user: getUserResponseData(user),
  });
};

export const uploadResume = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  if (!req.file) {
    throw new BadRequestError('Please provide a PDF resume file.');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Delete previous Cloudinary asset if exists
  if (user.resumePublicId) {
    await deleteFromCloudinary(user.resumePublicId);
  }

  // Upload new file to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

  // Store resume URL, public_id, and original filename in MongoDB
  user.resumeUrl = result.secure_url;
  user.resumePublicId = result.public_id;
  user.resumeOriginalName = req.file.originalname;

  await user.save();

  res.status(200).json({
    msg: 'Resume uploaded successfully!',
    user: getUserResponseData(user),
  });
};

export const deleteResume = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.resumeUrl && !user.resumePublicId) {
    throw new BadRequestError('No resume found to delete.');
  }

  if (user.resumePublicId) {
    await deleteFromCloudinary(user.resumePublicId);
  }

  user.resumeUrl = '';
  user.resumePublicId = '';
  user.resumeOriginalName = '';

  await user.save();

  res.status(200).json({
    msg: 'Resume deleted successfully!',
    user: getUserResponseData(user),
  });
};

