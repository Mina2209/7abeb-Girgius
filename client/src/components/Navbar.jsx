import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path) => {
    // Exact match
    if (location.pathname === path) {
      return true;
    }
    // Check if pathname starts with the path followed by a slash (for sub-routes)
    // This handles /hymns/add, /hymns/edit/:id, /tags/add, /tags/edit/:id, etc.
    return location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-27">
          <Link to="/" className="shrink-0">
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-23 w-auto rounded-full"
            />
          </Link>

          {/* Desktop menu */}
          <ul className="hidden lg:flex items-stretch divide-x divide-blue-700/60 bg-blue-500/40 rounded-md overflow-hidden">
            <li>
              <Link to="/liturgy" className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/liturgy") ? "bg-blue-700/60" : ""}`}>
                ليتورجيا
              </Link>
            </li>
            <li>
              <Link
                to="/hymns"
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/hymns") ? "bg-blue-700/60" : ""}`}
              >
                ترانيم
              </Link>
            </li>
            <li>
              <Link
                to="/agpeya"
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/agpeya") ? "bg-blue-700/60" : ""}`}
              >
                اجبية بالصور
              </Link>
            </li>
            <li>
              <Link
                to="/reflections"
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/reflections") ? "bg-blue-700/60" : ""}`}
              >
                تأملات
              </Link>
            </li>
            {isAdmin() && (
              <li>
                <Link
                  to="/tags"
                  className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/tags") ? "bg-blue-700/60" : ""}`}
                >
                  مواضيع
                </Link>
              </li>
            )}
            <li>
              <Link to="/sayings" className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/sayings") ? "bg-blue-700/60" : ""}`}>
                اقوال اباء
              </Link>
            </li>
            <li>
              <Link to="/image-library" className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/image-library") ? "bg-blue-700/60" : ""}`}>
                مكتبة صور
              </Link>
            </li>
            <li>
              <Link to="/sermons" className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/sermons") ? "bg-blue-700/60" : ""}`}>
                مكتبة عظات
              </Link>
            </li>
            <li>
              <Link to="/programs" className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/programs") ? "bg-blue-700/60" : ""}`}>
                برامج
              </Link>
            </li>
          </ul>

          {/* User menu */}
          {isAuthenticated() && (
            <div className="hidden lg:block relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/40 rounded-md hover:bg-blue-700/50"
              >
                <span className="text-sm">{user?.username}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-700'
                }`}>
                  {user?.role}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        User Management
                      </Link>
                      <Link
                        to="/admin/logs"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Activity Logs
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger button (mobile) */}
          <button
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md bg-blue-700/60 hover:bg-blue-700"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle navigation</span>
            {isOpen ? (
              // X icon
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

        </div>

        {/* Mobile menu panel */}
        <div id="mobile-menu" className={`${isOpen ? "block" : "hidden"} lg:hidden pt-3 pb-3`}>
          <ul className="flex flex-col gap-1 bg-blue-500/40 rounded-md overflow-hidden">
            <li>
              <Link to="/liturgy"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/liturgy") ? "bg-blue-700/60" : ""}`}>
                ليتورجيا
              </Link>
            </li>
            <li>
              <Link
                to="/hymns"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/hymns") ? "bg-blue-700/60" : ""}`}
              >
                ترانيم
              </Link>
            </li>
            <li>
              <Link
                to="/agpeya"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/agpeya") ? "bg-blue-700/60" : ""}`}
              >
                اجبية بالصور
              </Link>
            </li>
            <li>
              <Link
                to="/reflections"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/reflections") ? "bg-blue-700/60" : ""}`}
              >
                تأملات
              </Link>
            </li>
            {isAdmin() && (
              <li>
                <Link
                  to="/tags"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/tags") ? "bg-blue-700/60" : ""}`}
                >
                  مواضيع
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/sayings"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/sayings") ? "bg-blue-700/60" : ""}`}>
                اقوال اباء
              </Link>
            </li>
            <li>
              <Link
                to="/image-library"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/image-library") ? "bg-blue-700/60" : ""}`}>
                مكتبة صور
              </Link>
            </li>
            <li>
              <Link
                to="/sermons"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/sermons") ? "bg-blue-700/60" : ""}`}>
                مكتبة عظات
              </Link>
            </li>
            <li>
              <Link to="/programs"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/programs") ? "bg-blue-700/60" : ""}`}>
                برامج
              </Link>
            </li>
            
            {/* Mobile user menu */}
            {isAuthenticated() && (
              <>
                <li className="border-t border-blue-700/60 mt-2 pt-2">
                  <div className="px-4 py-2 text-sm">
                    User: {user?.username} ({user?.role})
                  </div>
                </li>
                {isAdmin() && (
                  <>
                    <li>
                      <Link
                        to="/admin/users"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 hover:bg-blue-700/50"
                      >
                        User Management
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/logs"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 hover:bg-blue-700/50"
                      >
                        Activity Logs
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-blue-700/50"
                  >
                    Logout
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
