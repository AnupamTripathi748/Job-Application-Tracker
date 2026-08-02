import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Briefcase, CheckCircle, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
  const { user } = useAuth();

  // Redirect to Dashboard if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      title: 'Visual Pipeline Analytics',
      description: 'Get real-time insights on your applications, interviews, offers, and rejection ratios through dynamic visual charts.',
      icon: <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      title: 'Effortless Pipeline CRUD',
      description: 'Add, update, and manage company submissions with detailed parameters like salary, location, job type, and notes.',
      icon: <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      title: 'Real-Time Stage Mapping',
      description: 'Track your transition through Applied, Online Assessments, Interviews, and Final HR rounds seamlessly.',
      icon: <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Navigation */}
      <nav className="flex h-16 items-center justify-between px-6 md:px-12 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            CareerTrack
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/register"
            className="rounded-xl bg-indigo-600 px-4.5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Organize your career search today
        </span>
        
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
          Track Your Job Search. <br />
          <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-sky-400">
            Secure Your Next Offer.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-400 md:text-lg">
          CareerTrack is a production-grade, highly intuitive Job Application Tracker. 
          Stop using messy spreadsheets. Manage recruiters, track OA rounds, analyze progress, 
          and excel in your software engineering job hunt.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600 w-full sm:w-auto justify-center"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 w-full sm:w-auto justify-center"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-slate-200/50 bg-white py-16 dark:border-slate-800/50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Powerful Features for Serious Job Seekers
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Designed by architects to maximize efficiency, visual simplicity, and structural safety.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition dark:border-slate-900 dark:bg-slate-950/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                  {feat.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 text-center text-xs text-slate-400 dark:border-slate-800/50 dark:bg-slate-950">
        <p>© 2026 CareerTrack. Production MERN Stack Architecture.</p>
      </footer>
    </div>
  );
};

export default Landing;
