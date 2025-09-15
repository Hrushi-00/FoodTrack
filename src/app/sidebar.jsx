import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, Outlet, Link } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Top Navbar on Mobile */}
      <nav className="w-full bg-gray-800 text-white flex items-center justify-between px-4 py-3 md:hidden fixed top-0 left-0 z-40">
        <h1 className="text-xl font-bold">My App</h1>
        {/* Toggle icon -- hamburger when closed, cross when open */}
        {isOpen ? (
          <FaTimes className="text-xl cursor-pointer" onClick={() => setIsOpen(false)} />
        ) : (
          <FaBars className="text-xl cursor-pointer" onClick={() => setIsOpen(true)} />
        )}
      </nav>

      {/* Slide-out Drawer for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          {/* Drawer */}
          <div className="absolute top-0 left-0 w-64 h-full bg-gray-800 text-white">
            <nav className="flex flex-col p-4 space-y-4 mt-10">
              <Link to="/Dashboard/home" className="flex items-center gap-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>
                <FaHome /> DashBoard
              </Link>
              <Link to="/Dashboard/about" className="flex items-center gap-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>
                <FaUser /> Menu Overview
              </Link>
              <Link to="/Dashboard/report" className="flex items-center gap-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>
                <FaCog /> Report
              </Link>
              <Link to="/Dashboard/settings" className="flex items-center gap-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>
                <FaCog /> Settings
              </Link>
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-sm mt-4"
              >
                <FaSignOutAlt className="h-4 w-4" /> Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white z-30">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">My App</h1>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-gray-300">
            <FaHome /> DashBoard
          </Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-gray-300">
            <FaUser /> Menu Overview
          </Link>
          <Link to="/report" className="flex items-center gap-2 hover:text-gray-300">
            <FaCog /> Report
          </Link>
          <Link to="/settings" className="flex items-center gap-2 hover:text-gray-300">
            <FaCog /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-sm mt-4"
          >
            <FaSignOutAlt className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-16 md:mt-0 p-4">
        <Outlet />
      </main>
    </div>
  );
}
