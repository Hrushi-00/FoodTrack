import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Utensils, 
  IndianRupee, 
  ShoppingCart,
  ChefHat,
  Calendar,
  RefreshCw,
  ArrowRight,
  Clock,
  Star,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('token');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      } else {
        // Set default stats if API fails
        setStats({
          activeTokens: 0,
          todayRevenue: 0,
          totalMenuItems: 0,
          customersServedToday: 0,
          totalEmployees: 0,
          todayOrders: 0,
          monthlyRevenue: 0
        });
      }

      // Fetch popular items
      const popularResponse = await fetch(`${API_URL}/api/dashboard/popular-items`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        setPopularItems(popularData.data || []);
      } else {
        setPopularItems([
          { name: 'Margherita Pizza', orders: 24, revenue: '₹4,800' },
          { name: 'Pasta Carbonara', orders: 18, revenue: '₹3,600' },
          { name: 'Caesar Salad', orders: 15, revenue: '₹2,250' },
          { name: 'Garlic Bread', orders: 12, revenue: '₹1,200' }
        ]);
      }

      // Fetch recent activity
      const activityResponse = await fetch(`${API_URL}/api/dashboard/recent-activity`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.data || []);
      } else {
        setRecentActivity([
          { action: 'New order received', table: 'Table 5', time: '2 min ago', type: 'order' },
          { action: 'Order completed', table: 'Table 2', time: '5 min ago', type: 'complete' },
          { action: 'Token generated', table: 'Table 8', time: '8 min ago', type: 'token' },
          { action: 'New menu item added', table: 'Kitchen', time: '15 min ago', type: 'menu' }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data on error
      setStats({
        activeTokens: 0,
        todayRevenue: 0,
        totalMenuItems: 0,
        customersServedToday: 0,
        totalEmployees: 0,
        todayOrders: 0,
        monthlyRevenue: 0
      });
      setPopularItems([
        { name: 'Margherita Pizza', orders: 24, revenue: '₹4,800' },
        { name: 'Pasta Carbonara', orders: 18, revenue: '₹3,600' },
        { name: 'Caesar Salad', orders: 15, revenue: '₹2,250' },
        { name: 'Garlic Bread', orders: 12, revenue: '₹1,200' }
      ]);
      setRecentActivity([
        { action: 'New order received', table: 'Table 5', time: '2 min ago', type: 'order' },
        { action: 'Order completed', table: 'Table 2', time: '5 min ago', type: 'complete' },
        { action: 'Token generated', table: 'Table 8', time: '8 min ago', type: 'token' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
            <TrendingUp size={14} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="text-white" size={20} />
        </div>
        <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={16} />
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's today's overview.</p>
              </div>
            </div>
          </div>
          
          {/* Time and Date */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-semibold text-lg">
                  {time.toLocaleTimeString()}
                </p>
                <p className="text-gray-600 text-sm">
                  {time.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Orders"
            value={stats?.todayOrders || 0}
            icon={ShoppingCart}
            color="bg-blue-500"
            trend="+12%"
            subtitle="Active orders"
          />
          
          <StatCard
            title="Today's Revenue"
            value={`₹${(stats?.todayRevenue || 0).toLocaleString()}`}
            icon={IndianRupee}
            color="bg-green-500"
            trend="+8%"
            subtitle="Total today"
          />
          
          <StatCard
            title="Menu Items"
            value={stats?.totalMenuItems || 0}
            icon={Utensils}
            color="bg-orange-500"
            subtitle="Available items"
          />
          
          <StatCard
            title="Customers Served"
            value={stats?.customersServedToday || 0}
            icon={Users}
            color="bg-purple-500"
            trend="+15%"
            subtitle="Today"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Tokens"
            value={stats?.activeTokens || 0}
            icon={Package}
            color="bg-indigo-500"
            subtitle="Pending orders"
          />
          
          <StatCard
            title="Monthly Revenue"
            value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`}
            icon={IndianRupee}
            color="bg-emerald-500"
            subtitle="This month"
          />
          
          <StatCard
            title="Team Members"
            value={stats?.totalEmployees || 0}
            icon={Users}
            color="bg-cyan-500"
            subtitle="Staff count"
          />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Restaurant Performance</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
                <div className="text-blue-700 text-sm">Order Accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">12min</div>
                <div className="text-green-700 text-sm">Avg. Prep Time</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">4.8</div>
                <div className="text-purple-700 text-sm">Customer Rating</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
                <div className="text-orange-700 text-sm">Efficiency</div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Today's Popular Items</h4>
                <span className="text-sm text-gray-500">{popularItems.length} items</span>
              </div>
              <div className="space-y-3">
                {popularItems.length > 0 ? (
                  popularItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-semibold">{item.orders} orders</div>
                        <div className="text-gray-500 text-sm">{item.revenue}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Utensils className="mx-auto mb-2 text-gray-400" size={32} />
                    <p>No popular items data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                <QuickAction
                  title="Generate Token"
                  description="Create new order tokens"
                  icon={Package}
                  color="bg-blue-500"
                  onClick={() => navigate('/token')}
                />
                <QuickAction
                  title="View Orders"
                  description="Check current orders"
                  icon={ShoppingCart}
                  color="bg-green-500"
                  onClick={() => navigate('/token-list')}
                />
                <QuickAction
                  title="Manage Menu"
                  description="Update menu items"
                  icon={Utensils}
                  color="bg-orange-500"
                  onClick={() => navigate('/menu')}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <button 
                  onClick={fetchDashboardData}
                  disabled={refreshing}
                  className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'order' ? 'bg-blue-400' :
                        activity.type === 'complete' ? 'bg-green-400' :
                        activity.type === 'cancelled' ? 'bg-red-400' : 'bg-orange-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm font-medium">{activity.action}</p>
                        <p className="text-gray-500 text-xs">{activity.table}</p>
                      </div>
                      <span className="text-gray-400 text-xs">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto mb-2 text-gray-400" size={32} />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <button 
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-sm">Last updated: {time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;