import React, { useState, useEffect } from 'react';
import { Calendar, Search, Printer, Download, Filter, ChevronDown, ChevronUp, List, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const TokenViewer = () => {
  const [tokens, setTokens] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedToken, setExpandedToken] = useState(null);
  const [filterTable, setFilterTable] = useState('');
  const [activeTab, setActiveTab] = useState('byDate');

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Fetch tokens by date
  const fetchTokensByDate = async () => {
    if (!selectedDate) {
      showMessage('error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = selectedDate.split('-');
      const response = await fetch(`${API_URL}/api/tokens/date/${year}/${month}/${day}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
        if (data.length === 0) {
          showMessage('info', 'No tokens found for this date');
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to fetch tokens');
        setTokens([]);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch tokens');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tokens
  const fetchAllTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tokens/my-tokens`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
        if (data.length === 0) {
          showMessage('info', 'No tokens found');
        }
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to fetch tokens');
        setTokens([]);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch tokens');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle token details
  const toggleTokenDetails = (tokenId) => {
    setExpandedToken(expandedToken === tokenId ? null : tokenId);
  };

  // Filter tokens by table number
  const filteredTokens = tokens.filter(token => 
    filterTable ? token.tableNumber.toString().includes(filterTable) : true
  );

  // Calculate totals for a token
  const calculateTokenTotals = (token) => {
    const subtotal = token.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  // Export tokens to CSV
  const exportToCSV = () => {
    if (filteredTokens.length === 0) {
      showMessage('error', 'No tokens to export');
      return;
    }

    const headers = ['Token No', 'Date', 'Table No', 'Items Count', 'Subtotal', 'Tax', 'Grand Total'];
    const csvData = filteredTokens.map(token => {
      const totals = calculateTokenTotals(token);
      return [
        token.tokenNumber,
        token.date,
        token.tableNumber,
        token.items.length,
        totals.subtotal.toFixed(2),
        totals.tax.toFixed(2),
        totals.grandTotal.toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tokens-${selectedDate || 'all'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showMessage('success', 'Tokens exported successfully');
  };

  // Auto-fetch when switching tabs
  useEffect(() => {
    if (activeTab === 'byDate') {
      fetchTokensByDate();
    } else if (activeTab === 'all') {
      fetchAllTokens();
    }
  }, [activeTab]);

  // Get unique table numbers for filter
  const uniqueTables = [...new Set(tokens.map(token => token.tableNumber))].sort();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#035397] rounded-full mb-4">
            <Printer className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Token Viewer
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage your generated tokens
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : message.type === 'info'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('byDate')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-3 ${
                activeTab === 'byDate' 
                  ? 'bg-[#035397] text-white border-b-2 border-[#035397]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar size={20} />
              By Date
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-3 ${
                activeTab === 'all' 
                  ? 'bg-[#035397] text-white border-b-2 border-[#035397]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              All Tokens
            </button>
          </div>

          <div className="p-6">
            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Date Picker */}
              {activeTab === 'byDate' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={fetchTokensByDate}
                      disabled={loading}
                      className="px-6 py-3 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                    >
                      <Search size={20} />
                      Search
                    </button>
                  </div>
                </div>
              )}

              {/* Table Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Table
                </label>
                <div className="flex gap-2">
                  <select
                    value={filterTable}
                    onChange={(e) => setFilterTable(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Tables</option>
                    {uniqueTables.map(table => (
                      <option key={table} value={table}>
                        Table {table}
                      </option>
                    ))}
                  </select>
                  {filterTable && (
                    <button
                      onClick={() => setFilterTable('')}
                      className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X size={16} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-end">
                {activeTab === 'all' && (
                  <button
                    onClick={fetchAllTokens}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Search size={20} />
                    Refresh
                  </button>
                )}
                <button
                  onClick={exportToCSV}
                  disabled={filteredTokens.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={20} />
                  Export
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#035397] mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading tokens...</p>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <List size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No tokens found</p>
                <p className="text-gray-400 mt-2">
                  {activeTab === 'byDate' 
                    ? 'Try selecting a different date'
                    : 'No tokens have been generated yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{filteredTokens.length}</div>
                    <div className="text-sm text-gray-600">Total Tokens</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredTokens.reduce((sum, token) => sum + token.items.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Set(filteredTokens.map(token => token.tableNumber)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Tables</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{filteredTokens.reduce((sum, token) => sum + calculateTokenTotals(token).grandTotal, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>

                {/* Tokens List */}
                <div className="space-y-3">
                  {filteredTokens.map((token) => {
                    const totals = calculateTokenTotals(token);
                    const isExpanded = expandedToken === token._id;

                    return (
                      <div key={token._id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        {/* Token Header */}
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-center"
                          onClick={() => toggleTokenDetails(token._id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-800 rounded-lg p-3">
                              <span className="font-bold text-lg">#{token.tokenNumber}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">
                                Table {token.tableNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {token.date} • {token.items.length} item{token.items.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-semibold">
                              ₹{totals.grandTotal.toFixed(2)}
                            </span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Items List */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Order Items</h4>
                                <div className="space-y-3">
                                  {token.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-800">{item.name}</div>
                                        <div className="text-sm text-gray-500">Code: {item.menuItemId}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm text-gray-600">
                                          {item.qty} × ₹{item.price.toFixed(2)}
                                        </div>
                                        <div className="font-semibold text-gray-800">
                                          ₹{(item.qty * item.price).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Totals and Info */}
                              <div className="space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">Bill Summary</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tax (10%):</span>
                                      <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-3">
                                      <span>Grand Total:</span>
                                      <span className="text-green-600">₹{totals.grandTotal.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">Token Info</h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong>Generated:</strong> {token.date} at {new Date(token.createdAt).toLocaleTimeString()}</p>
                                    {token.hotelName && <p><strong>Hotel:</strong> {token.hotelName}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenViewer;