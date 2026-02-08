import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUpload } from "../contexts/UploadContext";
import ThemeToggle from "./ThemeToggle";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { activeCount } = useUpload();

  const isActive = (path) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = (path) =>
    `block px-4 py-3 hover:bg-blue-700/50 dark:hover:bg-slate-700/50 transition-colors ${isActive(path) ? "bg-blue-700/60 dark:bg-slate-700/60" : ""
    }`;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-800 dark:to-slate-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-27">
          <Link to="/" className="shrink-0">
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-23 w-auto rounded-full shadow-md"
            />
          </Link>

          {/* Desktop menu */}
          <ul className="hidden lg:flex items-stretch divide-x divide-blue-700/40 dark:divide-slate-600/40 bg-blue-500/30 dark:bg-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
            <li>
              <Link to="/liturgy" className={navLinkClass("/liturgy")}>ليتورجيا</Link>
            </li>
            <li>
              <Link to="/hymns" className={navLinkClass("/hymns")}>ترانيم</Link>
            </li>
            <li>
              <Link to="/agpeya" className={navLinkClass("/agpeya")}>اجبية بالصور</Link>
            </li>
            <li>
              <Link to="/reflections" className={navLinkClass("/reflections")}>تأملات</Link>
            </li>
            {isAdmin() && (
              <li>
                <Link to="/tags" className={navLinkClass("/tags")}>مواضيع</Link>
              </li>
            )}
            <li>
              <Link to="/sayings" className={navLinkClass("/sayings")}>اقوال اباء</Link>
            </li>
            <li>
              <Link to="/image-library" className={navLinkClass("/image-library")}>مكتبة صور</Link>
            </li>
            <li>
              <Link to="/sermons" className={navLinkClass("/sermons")}>مكتبة عظات</Link>
            </li>
            <li>
              <Link to="/programs" className={navLinkClass("/programs")}>برامج</Link>
            </li>
          </ul>

          {/* Right side controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Upload indicator in navbar */}
            {activeCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/40 dark:bg-slate-700/50 rounded-lg">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span className="text-sm">{activeCount} تحميل</span>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User menu */}
            {isAuthenticated() && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/40 dark:bg-slate-700/50 rounded-xl hover:bg-blue-700/50 dark:hover:bg-slate-600/50 transition-colors"
                >
                  <span className="text-sm font-medium">{user?.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'ADMIN'
                      ? 'bg-purple-500/80'
                      : 'bg-blue-700/80 dark:bg-slate-600/80'
                    }`}>
                    {user?.role === 'ADMIN' ? 'مدير' : 'محرر'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-slate-700">
                    {isAdmin() && (
                      <>
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserGroupIcon className="w-5 h-5 text-gray-400" />
                          إدارة المستخدمين
                        </Link>
                        <Link
                          to="/admin/logs"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                          سجل النشاط
                        </Link>
                        <Link
                          to="/admin/backup"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
                          النسخ الاحتياطي
                        </Link>
                        <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger button (mobile) */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-700/60 dark:bg-slate-700/60 hover:bg-blue-700 dark:hover:bg-slate-600 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span className="sr-only">Toggle navigation</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div id="mobile-menu" className={`${isOpen ? "block" : "hidden"} lg:hidden pt-3 pb-3`}>
          <ul className="flex flex-col gap-1 bg-blue-500/30 dark:bg-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
            <li>
              <Link to="/liturgy" onClick={() => setIsOpen(false)} className={navLinkClass("/liturgy")}>ليتورجيا</Link>
            </li>
            <li>
              <Link to="/hymns" onClick={() => setIsOpen(false)} className={navLinkClass("/hymns")}>ترانيم</Link>
            </li>
            <li>
              <Link to="/agpeya" onClick={() => setIsOpen(false)} className={navLinkClass("/agpeya")}>اجبية بالصور</Link>
            </li>
            <li>
              <Link to="/reflections" onClick={() => setIsOpen(false)} className={navLinkClass("/reflections")}>تأملات</Link>
            </li>
            {isAdmin() && (
              <li>
                <Link to="/tags" onClick={() => setIsOpen(false)} className={navLinkClass("/tags")}>مواضيع</Link>
              </li>
            )}
            <li>
              <Link to="/sayings" onClick={() => setIsOpen(false)} className={navLinkClass("/sayings")}>اقوال اباء</Link>
            </li>
            <li>
              <Link to="/image-library" onClick={() => setIsOpen(false)} className={navLinkClass("/image-library")}>مكتبة صور</Link>
            </li>
            <li>
              <Link to="/sermons" onClick={() => setIsOpen(false)} className={navLinkClass("/sermons")}>مكتبة عظات</Link>
            </li>
            <li>
              <Link to="/programs" onClick={() => setIsOpen(false)} className={navLinkClass("/programs")}>برامج</Link>
            </li>

            {/* Mobile user menu */}
            {isAuthenticated() && (
              <>
                <li className="border-t border-blue-700/40 dark:border-slate-600/40 mt-2 pt-2">
                  <div className="px-4 py-2 text-sm flex items-center gap-2">
                    <span>{user?.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-500/80' : 'bg-blue-700/80 dark:bg-slate-600/80'
                      }`}>
                      {user?.role === 'ADMIN' ? 'مدير' : 'محرر'}
                    </span>
                  </div>
                </li>
                {isAdmin() && (
                  <>
                    <li>
                      <Link to="/admin/users" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-blue-700/50 dark:hover:bg-slate-700/50">
                        إدارة المستخدمين
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/logs" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-blue-700/50 dark:hover:bg-slate-700/50">
                        سجل النشاط
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/backup" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-blue-700/50 dark:hover:bg-slate-700/50">
                        النسخ الاحتياطي
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/20">
                    تسجيل الخروج
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
