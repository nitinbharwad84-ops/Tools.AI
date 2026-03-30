import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronRight, User, LogOut, Settings } from "lucide-react";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { ToolId } from "./components/Dashboard";
import { useAuthStore } from "./stores/authStore";
import { useNavigate, useLocation, Outlet, Link, useParams } from "react-router-dom";

export default function App() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toolId } = useParams<{ toolId: string }>();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/"
              className="flex items-center gap-3 cursor-pointer group" 
            >
              <img src="/logo.svg" alt="Nexus AI Logo" className="w-8 h-8 rounded-lg shadow-md shadow-primary/20 object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="font-bold tracking-tighter hidden sm:block dark:text-white group-hover:text-primary transition-colors duration-300">Nexus AI</span>
            </Link>
            
            <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <Link 
                to="/dashboard"
                className={`hover:text-primary transition-colors flex items-center gap-1.5 ${location.pathname === "/dashboard" ? "text-slate-800 dark:text-slate-200 font-semibold" : ""}`}
              >
                {location.pathname.includes("/tools/") && <ArrowLeft className="w-3 h-3 hidden sm:block" />}
                Dashboard
              </Link>
              
              {location.pathname.includes("/tools/") && toolId && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <span className="text-primary font-semibold capitalize flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-md">
                    {toolId.replace("-", " ")}
                  </span>
                </>
              )}
              {location.pathname === "/history" && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <span className="text-primary font-semibold capitalize flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-md">
                    History
                  </span>
                </>
              )}
              {location.pathname === "/profile" && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <span className="text-primary font-semibold capitalize flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-md">
                    Profile
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <DarkModeToggle />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {profile?.full_name || user?.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={async () => {
                            setIsProfileOpen(false);
                            await signOut();
                            navigate("/auth");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
              >
                Sign In
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Engine Active
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-slate-800 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Nexus AI Logo" className="w-6 h-6 rounded-md shadow-sm object-cover grayscale opacity-70" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nexus AI Platform v1.0</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Text & Logic</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Gemini 3.1 Pro</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Visuals</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Gemini 2.5 Flash Image</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Video</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Gemini 3.1 Flash Lite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

