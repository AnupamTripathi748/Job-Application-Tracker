import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, UserCheck, LogOut, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logoutUser } = useAuth();

  const links = [
    { text: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { text: 'All Jobs', path: '/all-jobs', icon: <Briefcase className="h-5 w-5" /> },
    { text: 'Profile', path: '/profile', icon: <UserCheck className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-900">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              CareerTrack
            </span>
          </div>
          {/* Close Button Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200'
                }`
              }
            >
              {link.icon}
              {link.text}
            </NavLink>
          ))}
        </nav>

        {/* Footer Account / Logout */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-900">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition duration-200 dark:text-rose-400 dark:hover:bg-rose-950/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
