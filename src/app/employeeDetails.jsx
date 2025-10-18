import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  Calendar, 
  User, 
  Phone, 
  Briefcase,
  Plus,
  RefreshCw
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash'
  });

  const getAuthToken = () => localStorage.getItem('token');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Fetch employee payment details
  const fetchEmployeePaymentDetails = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/employees/${employeeId}/report/payments`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        showMessage('error', 'Failed to fetch employee payment details');
      }
    } catch (error) {
      showMessage('error', 'Error fetching employee payment details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch employee leave details
  const fetchEmployeeLeaveDetails = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/employees/${employeeId}/report/leaves`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        showMessage('error', 'Failed to fetch employee leave details');
      }
    } catch (error) {
      showMessage('error', 'Error fetching employee leave details');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data based on active tab
  const fetchEmployeeData = async () => {
    if (activeTab === 'payments') {
      await fetchEmployeePaymentDetails();
    } else if (activeTab === 'leaves') {
      await fetchEmployeeLeaveDetails();
    }
  };

  // Add leave
  const handleAddLeave = async (e) => {
    e.preventDefault();
    
    if (!leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
      showMessage('error', 'Please fill all leave details');
      return;
    }

    // Validate dates
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    
    if (endDate < startDate) {
      showMessage('error', 'End date cannot be before start date');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(leaveData)
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', data.message || 'Leave added successfully');
        setShowLeaveForm(false);
        setLeaveData({ startDate: '', endDate: '', reason: '' });
        // Refresh leave data
        if (activeTab === 'leaves') {
          await fetchEmployeeLeaveDetails();
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to add leave');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
  };

  // Add payment
  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      showMessage('error', 'Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', data.message || 'Payment recorded successfully');
        setShowPaymentForm(false);
        setPaymentData({ amount: '', method: 'cash' });
        // Refresh payment data
        if (activeTab === 'payments') {
          await fetchEmployeePaymentDetails();
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to record payment');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Refresh data
  const handleRefresh = async () => {
    await fetchEmployeeData();
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeePaymentDetails(); // Load initial data with payment details
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId && employee) {
      fetchEmployeeData();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Employee not found</p>
          <button
            onClick={() => navigate('/employees')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  // Calculate leave duration
  const calculateLeaveDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    return dayDiff;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.employee?.name}</h1>
              <p className="text-gray-600">Employee details and management</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Employee Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{employee.employee?.name}</h3>
                <p className="text-gray-600">{employee.employee?.position}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} />
                  <span>{employee.employee?.contact}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={18} />
                  <span>{employee.employee?.position}</span>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <IndianRupee size={18} />
                  <span className="font-semibold">₹{employee.employee?.salary?.toLocaleString()}/month</span>
                </div>
              </div>
            </div>

            {/* Salary Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Salary Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Salary:</span>
                  <span className="font-semibold">₹{employee.employee?.salary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="text-green-600 font-semibold">₹{employee.totalPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="text-orange-600 font-semibold">₹{employee.remaining?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => handleTabChange('payments')}
                  className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'payments' 
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IndianRupee size={20} />
                  Payment History
                </button>
                <button
                  onClick={() => handleTabChange('leaves')}
                  className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'leaves' 
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={20} />
                  Leave History
                </button>
              </div>

              <div className="p-6">
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add Payment
                      </button>
                    </div>

                    {employee.paymentHistory?.length > 0 ? (
                      <div className="space-y-3">
                        {employee.paymentHistory.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">
                                ₹{payment.amount?.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {payment.method} • {new Date(payment.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-green-600 font-semibold">
                              Paid
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <IndianRupee className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>No payment records found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Leaves Tab */}
                {activeTab === 'leaves' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Leave History</h3>
                      <button
                        onClick={() => setShowLeaveForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add Leave
                      </button>
                    </div>

                    {employee.leaveHistory?.length > 0 ? (
                      <div className="space-y-3">
                        {employee.leaveHistory.map((leave, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-gray-900">
                                {leave.reason}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Duration: {calculateLeaveDuration(leave.startDate, leave.endDate)} days
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>No leave records found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Leave</h3>
            
            <form onSubmit={handleAddLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter leave reason"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;