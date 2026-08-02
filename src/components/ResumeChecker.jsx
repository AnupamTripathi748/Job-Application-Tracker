import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Award,
  BarChart3,
  FileCheck2,
  X,
  Bot,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResumeChecker = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const loadingSteps = [
    'Parsing PDF text content...',
    'Auditing ATS keywords & section formats...',
    'Evaluating skills, experience impact & metrics with Gemini AI...',
    'Generating detailed resume report...'
  ];

  const handleFileSelect = (selectedFile) => {
    setErrorMsg(null);
    if (!selectedFile) return;

    // Check file type
    const isPdf =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      toast.error('Invalid file format. Please upload a PDF file.');
      setErrorMsg('Only PDF files are supported.');
      return;
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 5MB limit.');
      setErrorMsg('File size must be 5MB or less.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a PDF resume file to upload.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setLoadingStep(0);

    // Simulate step message increments during backend request
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/jobs/check-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.data) {
        setResult(response.data);
        toast.success('Resume analyzed successfully!');
      } else {
        throw new Error('No data received from AI analyzer.');
      }
    } catch (error) {
      console.error('Resume analysis failed:', error);
      const msg = error.response?.data?.msg || error.message || 'Failed to analyze resume. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper color function for score bars
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-500 dark:text-emerald-400 dark:bg-emerald-500';
    if (score >= 60) return 'text-amber-600 bg-amber-500 dark:text-amber-400 dark:bg-amber-500';
    return 'text-rose-600 bg-rose-500 dark:text-rose-400 dark:bg-rose-500';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800' };
    return { label: 'Needs Work', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800' };
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              AI Resume Checker
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Bot className="h-3.5 w-3.5" /> Powered by Gemini
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your PDF resume to get instant ATS optimization, scoring, and actionable feedback.
            </p>
          </div>
        </div>

        {result && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Analyze Another Resume
          </button>
        )}
      </div>

      {/* Main Body */}
      {!result ? (
        <div className="mt-6 space-y-6">
          {/* Dropzone Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20'
                : file
                ? 'border-indigo-200 bg-indigo-50/20 dark:border-indigo-900/50 dark:bg-indigo-950/10'
                : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-800'
            } ${!file && 'cursor-pointer'}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {!file ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to upload or drag & drop your PDF resume
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PDF files only, up to 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900 dark:bg-slate-900">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={isAnalyzing}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analyze Action Button */}
          {file && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Resume with Gemini AI
            </button>
          )}

          {/* Loading Indicator State */}
          {isAnalyzing && (
            <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 text-center dark:border-indigo-950 dark:bg-indigo-950/20">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md animate-bounce">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  AI Resume Analysis in Progress...
                </h4>
                <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
              <div className="mx-auto max-w-xs space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-500"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xxs text-slate-400">
                  <span>Step {loadingStep + 1} of {loadingSteps.length}</span>
                  <span>Please wait</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Analysis Results Display */
        <div className="mt-6 space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-white p-5 dark:border-indigo-950 dark:from-indigo-950/20 dark:to-slate-950">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FileCheck2 className="h-4 w-4" /> Executive Summary • {result.filename}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {result.data.summary}
            </p>
          </div>

          {/* Scores Overview Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Overall Resume Score */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Overall Quality
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreBadge(result.data.overallScore).color}`}>
                  {getScoreBadge(result.data.overallScore).label}
                </span>
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${getScoreColor(result.data.overallScore).split(' ')[0]}`}>
                  {result.data.overallScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${getScoreColor(result.data.overallScore).split(' ')[1]}`}
                    style={{ width: `${Math.min(100, Math.max(0, result.data.overallScore))}%` }}
                  />
                </div>
                <p className="text-xxs text-slate-400 text-right">Based on structure, impact, and clarity</p>
              </div>
            </div>

            {/* ATS Score */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" /> ATS Readiness
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreBadge(result.data.atsScore).color}`}>
                  {result.data.atsScore >= 80 ? 'ATS Friendly' : result.data.atsScore >= 60 ? 'Moderate Parsing' : 'Low Parsing Rate'}
                </span>
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${getScoreColor(result.data.atsScore).split(' ')[0]}`}>
                  {result.data.atsScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${getScoreColor(result.data.atsScore).split(' ')[1]}`}
                    style={{ width: `${Math.min(100, Math.max(0, result.data.atsScore))}%` }}
                  />
                </div>
                <p className="text-xxs text-slate-400 text-right">Keyword density & header parseability</p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths Card */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3 dark:border-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">Key Strengths</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {result.data.strengths && result.data.strengths.length > 0 ? (
                  result.data.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-500 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific strengths recorded.</p>
                )}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 dark:border-rose-900/40 dark:bg-rose-950/10">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3 dark:border-rose-900/30">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-300">Areas for Improvement</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {result.data.weaknesses && result.data.weaknesses.length > 0 ? (
                  result.data.weaknesses.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 text-rose-500 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No significant weaknesses identified.</p>
                )}
              </ul>
            </div>

            {/* Missing Skills Card */}
            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-5 dark:border-purple-900/40 dark:bg-purple-950/10">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-3 dark:border-purple-900/30">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-purple-950 dark:text-purple-300">Recommended Missing Skills</h3>
              </div>
              <div className="mt-3">
                {result.data.missingSkills && result.data.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.data.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-purple-800 shadow-2xs dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No critical missing skills detected!</p>
                )}
              </div>
            </div>

            {/* Improvement Suggestions Card */}
            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/10">
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-3 dark:border-indigo-900/30">
                <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-300">Actionable Recommendations</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {result.data.improvementSuggestions && result.data.improvementSuggestions.length > 0 ? (
                  result.data.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No additional suggestions required.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeChecker;
