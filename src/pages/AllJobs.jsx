import React, { useEffect, useState } from 'react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import SearchContainer from '../components/SearchContainer';
import { Plus, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const AllJobs = () => {
  // Core application lists and filters
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [numOfPages, setNumOfPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Active filter state matching search container
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    jobType: 'all',
    workMode: 'all',
    sort: 'latest',
  });

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Modal Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: '',
      position: '',
      location: 'Remote',
      salary: '',
      jobType: 'full-time',
      workMode: 'remote',
      status: 'Applied',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Fetch jobs lists from REST API
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { search, status, jobType, workMode, sort } = filters;
      
      // Build search query params
      const params = {
        page: currentPage,
        sort,
      };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      if (jobType !== 'all') params.jobType = jobType;
      if (workMode !== 'all') params.workMode = workMode;

      const response = await api.get('/jobs', { params });
      const { jobs: fetchedJobs, totalJobs: total, numOfPages: pages } = response.data;
      
      setJobs(fetchedJobs);
      setTotalJobs(total);
      setNumOfPages(pages);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to fetch job applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when filters or page changes
  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // reset to page 1 on search / filter updates
  };

  // Open modal in creation mode
  const handleOpenAddModal = () => {
    setEditingJob(null);
    reset({
      company: '',
      position: '',
      location: 'Remote',
      salary: '',
      jobType: 'full-time',
      workMode: 'remote',
      status: 'Applied',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open modal in edit mode with prefilled values
  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    const dateVal = job.applicationDate && !isNaN(new Date(job.applicationDate).getTime())
      ? new Date(job.applicationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    reset({
      company: job.company || '',
      position: job.position || '',
      location: job.location || 'Remote',
      salary: job.salary || '',
      jobType: job.jobType || 'full-time',
      workMode: job.workMode || 'remote',
      status: job.status || 'Applied',
      applicationDate: dateVal,
      notes: job.notes || '',
    });
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDeleteJob = async (jobId) => {
    const toastId = toast.loading('Deleting job entry...');
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job application deleted', { id: toastId });
      fetchJobs(); // reload lists
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete application', { id: toastId });
    }
  };

  // Modal Submit handler (Creates or updates)
  const onSubmitForm = async (formData) => {
    const toastId = toast.loading(editingJob ? 'Saving changes...' : 'Creating job entry...');
    try {
      if (editingJob) {
        // Edit existing job
        await api.patch(`/jobs/${editingJob._id}`, formData);
        toast.success('Application updated successfully', { id: toastId });
      } else {
        // Create new job
        await api.post('/jobs', formData);
        toast.success('Application registered!', { id: toastId });
      }
      setIsModalOpen(false);
      fetchJobs(); // reload list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Action failed', { id: toastId });
    }
  };

  // Generate pagination arrays
  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= numOfPages) {
      setCurrentPage(pageNo);
    }
  };

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= numOfPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`h-9 w-9 rounded-xl text-sm font-bold transition ${
            currentPage === i
              ? 'bg-indigo-600 text-white shadow dark:bg-indigo-500'
              : 'border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Upper bar: Add Job button & header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Job Applications</h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus className="h-5 w-5" />
          Add Application
        </button>
      </div>

      {/* Query/Filters container */}
      <SearchContainer onSearchChange={handleFiltersChange} isLoading={isLoading} />

      {/* List content area */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
          <Briefcase className="h-16 w-16 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No applications tracked</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-450">
            Looks like you haven't tracked any applications matching the active filters. Go ahead and log your first submission!
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Add First Application
          </button>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-800 dark:text-slate-200 font-bold">{jobs.length}</span> of{' '}
            <span className="text-slate-800 dark:text-slate-200 font-bold">{totalJobs}</span> applications found
          </div>

          {/* Cards list */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>

          {/* Pagination bar */}
          {numOfPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {renderPageButtons()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === numOfPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-900">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {editingJob ? 'Edit Application Details' : 'Track New Job Application'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Company Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS, Google"
                    {...register('company', { required: 'Company is required' })}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  />
                  {errors.company && <span className="text-xxs font-bold text-rose-500">{errors.company.message}</span>}
                </div>

                {/* Job Role / Position */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Position / Job Role *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    {...register('position', { required: 'Position/Role is required' })}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  />
                  {errors.position && <span className="text-xxs font-bold text-rose-500">{errors.position.message}</span>}
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, Mumbai"
                    {...register('location')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  />
                </div>

                {/* Salary */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Salary / Compensation</label>
                  <input
                    type="text"
                    placeholder="e.g. 7-9 LPA, $120k"
                    {...register('salary')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  />
                </div>

                {/* Job Type Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Type</label>
                  <select
                    {...register('jobType')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Work Mode Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Work Mode</label>
                  <select
                    {...register('workMode')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  >
                    <option value="remote">Remote</option>
                    <option value="on-site">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Application Pipeline Stage</label>
                  <select
                    {...register('status')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  >
                    <option value="Applied">Applied</option>
                    <option value="OA">OA (Online Assessment)</option>
                    <option value="Interview">Interview Rounds</option>
                    <option value="HR">Final HR Round</option>
                    <option value="Offer">Offer Secured</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Selected">Selected & Joined</option>
                  </select>
                </div>

                {/* Application Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Application Date</label>
                  <input
                    type="date"
                    {...register('applicationDate')}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                  />
                </div>
              </div>

              {/* Notes text area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Notes / Interview Context</label>
                <textarea
                  placeholder="Add details about recruiters, technical topics covered, or DSA questions asked..."
                  rows={3}
                  {...register('notes')}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
                />
              </div>

              {/* Modal controls footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {editingJob ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllJobs;
