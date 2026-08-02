import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Briefcase, KeyRound, Mail, User, MapPin, Eye, EyeOff, RefreshCw, ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Register = () => {
  const { user, loginUser, registerUser, googleSignIn, forgotPassword, resetPassword } = useAuth();
  
  // View states: 'auth' (login/register), 'forgot' (request reset code), 'reset' (enter reset code + new password)
  const [viewState, setViewState] = useState('auth');
  const [isMember, setIsMember] = useState(true); // true = Login mode, false = Register mode
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [resetEmail, setResetEmail] = useState('');
  const [resetDevOTP, setResetDevOTP] = useState(null);
  const [resetEmailNotice, setResetEmailNotice] = useState(null);
  
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  // Redirect if user already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      location: 'Remote',
    },
  });

  // Reset form inputs when switching login/register
  useEffect(() => {
    reset();
  }, [isMember, reset]);

  // Main login / register submit handler
  const onSubmit = async (data) => {
    setSubmitting(true);
    const toastId = toast.loading(isMember ? 'Logging in...' : 'Creating your account...');

    try {
      if (isMember) {
        await loginUser({ email: data.email, password: data.password });
        toast.success('Welcome back!', { id: toastId });
        navigate('/');
      } else {
        await registerUser(data);
        toast.success('Account created successfully!', { id: toastId });
        navigate('/');
      }
    } catch (err) {
      toast.error(err || 'Authentication failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Connecting to Google...');
    try {
      await googleSignIn();
      toast.success('Signed in with Google!', { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error(err || 'Google Sign-In failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit handler for email verification OTP
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || (otpCode.trim() || '').length !== 6) {
      toast.error('Please enter a 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Verifying code...');

    try {
      await verifyEmail({ email: pendingVerification.email, otp: otpCode.trim() });
      toast.success('Email verified successfully! Welcome!', { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error(err || 'Verification failed. Please check your code.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle forgot password form submission (requests reset OTP)
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const emailToUse = resetEmail || getValues('email');
    if (!emailToUse || !emailToUse.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Sending password reset code...');

    try {
      const res = await forgotPassword(emailToUse.trim());
      toast.success(res.msg || 'Password reset code sent!', { id: toastId });
      setResetEmail(emailToUse.trim());
      if (res.devOTP) {
        setResetDevOTP(res.devOTP);
        setResetEmailNotice(res.emailNotice);
      } else {
        setResetDevOTP(null);
        setResetEmailNotice(null);
      }
      setViewState('reset');
    } catch (err) {
      toast.error(err || 'Failed to request password reset', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle final password reset with OTP and new password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode || (resetCode.trim() || '').length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }
    if (!newPassword || (newPassword || '').length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Updating password...');

    try {
      const res = await resetPassword({
        email: resetEmail,
        otp: resetCode.trim(),
        newPassword,
      });
      toast.success(res.msg || 'Password reset successfully! Please log in.', { id: toastId });
      setViewState('auth');
      setIsMember(true);
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      toast.error(err || 'Password reset failed. Please check your code.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    const toastId = toast.loading('Sending a new code...');

    try {
      if (viewState === 'verify') {
        const res = await resendOTP(pendingVerification.email);
        toast.success(res.msg || 'A new verification code has been sent to your email.', { id: toastId });
        if (res.devOTP) {
          setPendingVerification((prev) => ({ ...prev, devOTP: res.devOTP, emailNotice: res.emailNotice }));
        } else {
          setPendingVerification((prev) => ({ ...prev, devOTP: null, emailNotice: null }));
        }
      } else if (viewState === 'reset') {
        const res = await forgotPassword(resetEmail);
        toast.success(res.msg || 'A new password reset code has been sent.', { id: toastId });
        if (res.devOTP) {
          setResetDevOTP(res.devOTP);
          setResetEmailNotice(res.emailNotice);
        } else {
          setResetDevOTP(null);
          setResetEmailNotice(null);
        }
      }
    } catch (err) {
      toast.error(err || 'Failed to resend code.', { id: toastId });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900 transition-colors">
      {/* Top right floating theme selector */}
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand/Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg dark:bg-indigo-500">
            {viewState === 'forgot' || viewState === 'reset' ? (
              <Lock className="h-6 w-6" />
            ) : (
              <Briefcase className="h-6 w-6" />
            )}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {viewState === 'forgot'
              ? 'Forgot Password'
              : viewState === 'reset'
              ? 'Set New Password'
              : isMember
              ? 'Welcome back'
              : 'Create an account'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {viewState === 'forgot'
              ? 'Enter your registered email to receive a password reset code'
              : viewState === 'reset'
              ? `Enter the code sent to ${resetEmail} and choose a new password`
              : isMember
              ? 'Enter your credentials to manage your pipeline'
              : 'Get started by setting up your tracker profile'}
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-950 transition-all duration-300">
          
          {/* ================= 1. FORGOT PASSWORD REQUEST VIEW ================= */}
          {viewState === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled={submitting}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !resetEmail.trim()}
                className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {submitting ? 'Sending code...' : 'Send Reset Code'}
              </button>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setViewState('auth')}
                  className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. RESET PASSWORD INPUT VIEW ================= */}
          {viewState === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              {resetDevOTP && (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="font-semibold">{resetEmailNotice || '💡 Development Demo Mode:'}</p>
                  <p className="mt-1">
                    Your reset code is:{' '}
                    <strong className="font-mono text-indigo-600 dark:text-indigo-400 text-sm tracking-wider">{resetDevOTP}</strong>
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-slate-200 bg-slate-50/50 py-3 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={submitting}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  />
                  <KeyRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || (resetCode || '').length !== 6 || (newPassword || '').length < 6}
                className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {submitting ? 'Resetting password...' : 'Reset Password'}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewState('forgot')}
                  className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* ================= 3. LOGIN / REGISTER FORM ================= */}
          {viewState === 'auth' && (
            <div className="space-y-5">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <GoogleIcon />
                <span>{isMember ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white px-3 text-xs font-medium text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                  OR
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* 1. Name Field (Only in Register mode) */}
              {!isMember && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="John Doe"
                      disabled={submitting}
                      {...register('name', {
                        required: !isMember ? 'Name is required' : false,
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                      })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                    />
                    <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.name && <span className="text-xxs font-bold text-rose-500">{errors.name.message}</span>}
                </div>
              )}

              {/* 2. Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled={submitting}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.email && <span className="text-xxs font-bold text-rose-500">{errors.email.message}</span>}
              </div>

              {/* 3. Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
                  {isMember && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(getValues('email') || '');
                        setViewState('forgot');
                      }}
                      className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={submitting}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  />
                  <KeyRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && <span className="text-xxs font-bold text-rose-500">{errors.password.message}</span>}
              </div>

              {/* 4. Location Field (Only in Register mode) */}
              {!isMember && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Default Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Pune, Remote, Bangalore"
                      disabled={submitting}
                      {...register('location')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                    />
                    <MapPin className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isMember ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          </div>
          )}

          {/* Toggle Member status link */}
          {viewState === 'auth' && (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <span>{isMember ? 'Not a member yet?' : 'Already have an account?'}</span>
              <button
                onClick={() => setIsMember(!isMember)}
                disabled={submitting}
                className="ml-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {isMember ? 'Register now' : 'Login instead'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
