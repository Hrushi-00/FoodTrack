import { useState, useEffect } from "react";
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaQrcode,
  FaList,
  FaUsers,
  FaUtensils
} from "react-icons/fa";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hotelName, setHotelName] = useState("Restaurant");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch hotel name from profile API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/auth/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.hotelName) setHotelName(data.hotelName);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: FaHome },
    { path: "/token", label: "Generate Token", icon: FaQrcode },
    { path: "/menu", label: "Menu Management", icon: FaUtensils },
    { path: "/token-list", label: "Token List", icon: FaList },
    { path: "/employees", label: "Employees", icon: FaUsers },
    { path: "/settings", label: "Settings", icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Top Navbar (Mobile) */}
      <nav className="w-full bg-white border-b border-gray-200 text-gray-800 flex items-center justify-between px-4 py-3 md:hidden fixed top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <h1 className="text-lg font-semibold">{hotelName}</h1>
        </div>
        {isOpen ? (
          <FaTimes className="text-xl cursor-pointer text-gray-600" onClick={() => setIsOpen(false)} />
        ) : (
          <FaBars className="text-xl cursor-pointer text-gray-600" onClick={() => setIsOpen(true)} />
        )}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{hotelName}</h1>
                  <p className="text-sm text-gray-500">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`${isActive(item.path) ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 mt-4"
              >
                <FaSignOutAlt className="text-red-500" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 text-gray-800 z-30">
        {/* Sidebar Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{hotelName}</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon 
                  className={`text-lg ${isActive(item.path) ? "text-blue-600" : "text-gray-400"}`} 
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            <FaSignOutAlt className="text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 mt-16 md:mt-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}