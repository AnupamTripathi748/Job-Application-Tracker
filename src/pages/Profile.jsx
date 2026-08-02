import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  MapPin,
  UserCheck,
  CheckCircle,
  FileText,
  UploadCloud,
  ExternalLink,
  Trash2,
  RefreshCw,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, userLocation, updateUser, uploadResume, deleteResume } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: {
      name: user?.name || '',
      email: user?.email || '',
      location: userLocation || localStorage.getItem('job_tracker_location') || 'Remote',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Updating your profile...');

    try {
      await updateUser(data);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      toast.error(err || 'Failed to update profile', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Invalid file type. Please select a PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please choose a smaller PDF file.');
      return;
    }

    setIsUploadingResume(true);
    const toastId = toast.loading('Uploading resume to Cloudinary...');

    try {
      await uploadResume(file);
      toast.success('Resume uploaded successfully!', { id: toastId });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err || 'Failed to upload resume', { id: toastId });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    setIsDeletingResume(true);
    const toastId = toast.loading('Deleting resume...');

    try {
      await deleteResume();
      toast.success('Resume deleted successfully!', { id: toastId });
    } catch (err) {
      toast.error(err || 'Failed to delete resume', { id: toastId });
    } finally {
      setIsDeletingResume(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Profile Management</h1>
      </div>

      {/* Main Card - User Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-3 dark:border-slate-900">
          User Settings
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
            <div className="relative">
              <input
                type="text"
                disabled={isSubmitting}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 3, message: 'Name must be at least 3 characters' },
                })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
              />
              <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.name && <span className="text-xxs font-bold text-rose-500">{errors.name.message}</span>}
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                disabled={isSubmitting}
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

          {/* Location Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location</label>
            <div className="relative">
              <input
                type="text"
                disabled={isSubmitting}
                {...register('location', {
                  required: 'Location is required',
                })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
              />
              <MapPin className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.location && <span className="text-xxs font-bold text-rose-500">{errors.location.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <CheckCircle className="h-4 w-4" />
            Save Profile Settings
          </button>
        </form>
      </div>

      {/* Resume Section Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Resume / CV Management
            </h3>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            PDF Only • Max 5MB
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {user?.resumeUrl ? (
          /* ================= VIEW CURRENT RESUME ================= */
          <div className="mt-6 space-y-4">
            <div className="flex items-start justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm dark:bg-emerald-500">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.resumeOriginalName || 'Uploaded_Resume.pdf'}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Stored securely on Cloudinary
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Action Buttons */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {/* View Resume */}
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                View Resume
              </a>

              {/* Replace Resume */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume || isDeletingResume}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isUploadingResume ? 'animate-spin' : ''}`} />
                {isUploadingResume ? 'Uploading...' : 'Replace Resume'}
              </button>

              {/* Delete Resume */}
              <button
                type="button"
                onClick={handleDeleteResume}
                disabled={isUploadingResume || isDeletingResume}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                {isDeletingResume ? 'Deleting...' : 'Delete Resume'}
              </button>
            </div>
          </div>
        ) : (
          /* ================= UPLOAD NEW RESUME DROPZONE ================= */
          <div className="mt-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30'
                  : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-500/50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <UploadCloud className="h-6 w-6" />
              </div>

              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                {isUploadingResume ? 'Uploading PDF to Cloudinary...' : 'Click or Drag & Drop your PDF Resume'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports PDF documents up to 5MB
              </p>

              <button
                type="button"
                disabled={isUploadingResume}
                className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isUploadingResume ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    Select PDF File
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security notice / environment info block */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Storage & Security Architecture</h4>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Resumes are securely uploaded via Multer streaming to Cloudinary. Only the generated HTTPS URL and Cloudinary public ID are stored in your MongoDB database record. All resume endpoints are protected using JWT bearer token authentication.
        </p>
      </div>
    </div>
  );
};

export default Profile;

