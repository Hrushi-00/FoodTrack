import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaHotel, FaEye, FaEyeSlash, FaSave, FaKey, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    hotelName: '',
    phone: '',
    address: '',
    role: ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/users/profile`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        
        setProfile({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          hotelName: data.hotelName || '',
          phone: data.phone || '',
          address: data.address || '',
          role: data.role || ''
        });
      } else {
        showMessage('error', 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('error', 'Error fetching profile data');
    }
  };

  // Update profile - Only phone and address can be updated
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          phone: profile.phone,
          address: profile.address
          // Note: fullName, email, hotelName are not included as they cannot be changed
        })
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok) {
        showMessage('success', 'Profile updated successfully');
        fetchProfile(); // Refresh profile data
      } else {
        setErrors(data.errors || {});
        showMessage('error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (response.ok) {
        showMessage('success', 'Password changed successfully');
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
      } else {
        setErrors(data.errors || {});
        showMessage('error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes - Only allow changes to phone and address
  const handleProfileChange = (field, value) => {
    // Only allow phone and address to be changed
    if (field === 'phone' || field === 'address') {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePasswordChangeInput = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'profile' 
                  ? 'bg-blue-50 text-[#035397] border-b-2 border-[#035397]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUser className="text-lg" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'password' 
                  ? 'bg-blue-50 text-[#035397] border-b-2 border-[#035397]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaKey className="text-lg" />
              Change Password
            </button>
          </div>

          <div className="p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Read-only Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.fullName}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Full name cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name
                    </label>
                    <div className="relative">
                      <FaHotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.hotelName}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Restaurant name cannot be changed</p>
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your restaurant address"
                        required
                      />
                    </div>
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {profile.role || 'User'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaSave className="text-lg" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {/* Information Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Note:</h4>
                  <p className="text-sm text-blue-700">
                    Only Phone Number and Address can be updated. For changes to Full Name, Email, or Restaurant Name, please contact support.
                  </p>
                </div>
              </form>
            )}

            {/* Password Change */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChangeInput('currentPassword', e.target.value)}
                        className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChangeInput('newPassword', e.target.value)}
                        className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChangeInput('confirmPassword', e.target.value)}
                        className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaKey className="text-lg" />
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Make sure new password is different from current password</li>
                    <li>Confirm password must match new password</li>
                  </ul>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;