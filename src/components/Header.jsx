import React from 'react';
import { Menu, User as UserIcon, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ setSidebarOpen }) => {
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
  };

  // Generate responsive greeting based on local hours
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* Left side: Hamburger menu & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here's what's happening with your job applications today.
          </p>
        </div>
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Button */}
        <ThemeToggle />

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
            <p className="text-xxs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
