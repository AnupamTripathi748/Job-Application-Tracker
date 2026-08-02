import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Sync with actual DOM class
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Listen for class attribute changes on documentElement
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      aria-label="Toggle Dark Mode"
      className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-amber-500 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
