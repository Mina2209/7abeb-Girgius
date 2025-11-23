import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => {
    // Exact match
    if (location.pathname === path) {
      return true;
    }
    // Check if pathname starts with the path followed by a slash (for sub-routes)
    // This handles /hymns/add, /hymns/edit/:id, /tags/add, /tags/edit/:id, etc.
    return location.pathname.startsWith(path + '/');
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
            <li>
              <Link
                to="/tags"
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/tags") ? "bg-blue-700/60" : ""}`}
              >
                مواضيع
              </Link>
            </li>
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

          {/* Removed login dropdown for now */}

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
            <li>
              <Link
                to="/tags"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 hover:bg-blue-700/50 ${isActive("/tags") ? "bg-blue-700/60" : ""}`}
              >
                مواضيع
              </Link>
            </li>
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
