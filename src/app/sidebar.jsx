import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaUser, FaCog } from "react-icons/fa";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-screen bg-gray-800 text-white w-64 transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
        transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">My App</h1>
          <FaTimes
            className="cursor-pointer md:hidden"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          <Link to="/Dashboard/home" className="flex items-center gap-2 hover:text-gray-300">
            <FaHome /> DashBoard
          </Link>
          <Link to="/Dashboard/about" className="flex items-center gap-2 hover:text-gray-300">
            <FaUser /> Menu Overview
          </Link>
          <Link to="/Dashboard/contact" className="flex items-center gap-2 hover:text-gray-300">
            <FaCog /> Report
          </Link>
          <Link to="/Dashboard/contact" className="flex items-center gap-2 hover:text-gray-300">
            <FaCog /> Settings
          </Link>
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-sm"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen bg-gray-100 p-4">
        <FaBars
          className="text-2xl cursor-pointer md:hidden z-40"
          onClick={() => setIsOpen(true)}
        />
        <div className="mt-4">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
