import React, { useState, useEffect } from 'react';
import { Plus, Calendar, List, X, Printer, Trash2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL

const App = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [tokens, setTokens] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });


  const [forms, setForms] = useState([
    {
      id: 1,
      mealType: 'Breakfast',
      tableNumber: '',
      items: [{ name: '', qty: 1, price: 0 }]
    }
  ]);

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Add new form
  const addNewForm = () => {
    setForms([
      ...forms,
      {
        id: Date.now(),
        mealType: 'Breakfast',
        tableNumber: '',
        items: [{ name: '', qty: 1, price: 0 }]
      }
    ]);
  };

  // Remove form
  const removeForm = (formId) => {
    if (forms.length === 1) {
      showMessage('error', 'At least one form is required');
      return;
    }
    setForms(forms.filter(f => f.id !== formId));
  };

  // Update form field
  const updateForm = (formId, field, value) => {
    setForms(forms.map(f => 
      f.id === formId ? { ...f, [field]: value } : f
    ));
  };

  // Add item to specific form
  const addItem = (formId) => {
    setForms(forms.map(f => 
      f.id === formId 
        ? { ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }
        : f
    ));
  };

  // Remove item from specific form
  const removeItem = (formId, index) => {
    setForms(forms.map(f => 
      f.id === formId 
        ? { ...f, items: f.items.filter((_, i) => i !== index) }
        : f
    ));
  };

  // Update item in specific form
  const updateItem = (formId, index, field, value) => {
    setForms(forms.map(f => {
      if (f.id === formId) {
        const newItems = [...f.items];
        newItems[index][field] = field === 'name' ? value : parseFloat(value) || 0;
        return { ...f, items: newItems };
      }
      return f;
    }));
  };

  // Generate All Tokens
  const generateAllTokens = async () => {
    // Validate all forms
    for (let form of forms) {
      if (!form.tableNumber) {
        showMessage('error', 'Please enter table number for all forms');
        return;
      }
      const hasEmptyItems = form.items.some(item => !item.name || item.qty <= 0 || item.price <= 0);
      if (hasEmptyItems) {
        showMessage('error', 'Please fill all item details in all forms');
        return;
      }
    }

    setLoading(true);

    try {
      const responses = await Promise.all(
        forms.map(form =>
          fetch(`${API_URL}/tokens/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(form)
          })
        )
      );

      // Check if all succeeded
      const allSucceeded = responses.every(r => r.ok);
      
      if (allSucceeded) {
        showMessage('success', `${forms.length} tokens generated successfully!`);
        
        // Open print dialog after short delay
        setTimeout(() => {
          window.print();
        }, 500);

        // Reset forms
        setForms([
          {
            id: Date.now(),
            mealType: 'Breakfast',
            tableNumber: '',
            items: [{ name: '', qty: 1, price: 0 }]
          }
        ]);
      } else {
        showMessage('error', 'Some tokens failed to generate');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tokens by date
  const fetchTokensByDate = async () => {
    setLoading(true);
    try {
      const [year, month, day] = selectedDate.split('-');
      const response = await fetch(`${API_URL}/tokens/date/${year}/${month}/${day}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      } else {
        setTokens([]);
        showMessage('error', 'No tokens found for this date');
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tokens
  // const fetchAllTokens = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${API_URL}/tokens/my-tokens`, {
  //       headers: {
  //         'Authorization': `Bearer ${getAuthToken()}`
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setTokens(data);
  //     } else {
  //       setTokens([]);
  //       showMessage('error', 'No tokens found');
  //     }
  //   } catch (error) {
  //     showMessage('error', 'Failed to fetch tokens');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Calculate totals for display
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  // Auto-fetch when switching tabs
  // useEffect(() => {
  //   if (activeTab === 'byDate') {
  //     fetchTokensByDate();
  //   } else if (activeTab === 'all') {
  //     fetchAllTokens();
  //   }
  // }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:hidden">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Printer className="text-indigo-600" />
            Meal Token Management
          </h1>
          <p className="text-gray-600 mt-2">Generate and manage meal tokens for your restaurant</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg print:hidden ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 print:hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus size={20} />
              Generate Token
            </button>
            <button
              onClick={() => setActiveTab('byDate')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'byDate' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar size={20} />
              By Date
            </button>
            {/* <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              All Tokens
            </button> */}
          </div>

          <div className="p-6">
            {/* Generate Token Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                {/* Add Form Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Multiple Tables</h2>
                  <button
                    type="button"
                    onClick={addNewForm}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Another Table
                  </button>
                </div>

                {/* Multiple Forms */}
                <div className="space-y-6">
                  {forms.map((form, formIndex) => (
                    <div key={form.id} className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Table Form {formIndex + 1}</h3>
                        {forms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeForm(form.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Meal Type
                            </label>
                            <select
                              value={form.mealType}
                              onChange={(e) => updateForm(form.id, 'mealType', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                              <option value="Breakfast">Breakfast</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Dinner">Dinner</option>
                              <option value="Snacks">Snacks</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Table Number
                            </label>
                            <input
                              type="text"
                              value={form.tableNumber}
                              onChange={(e) => updateForm(form.id, 'tableNumber', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter table number"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Items</label>
                            <button
                              type="button"
                              onClick={() => addItem(form.id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-1"
                            >
                              <Plus size={16} />
                              Add Item
                            </button>
                          </div>

                          <div className="space-y-3">
                            {form.items.map((item, index) => (
                              <div key={index} className="flex gap-2 items-start bg-white p-2 rounded">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateItem(form.id, index, 'name', e.target.value)}
                                  placeholder="Item name"
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <input
                                  type="number"
                                  value={item.qty}
                                  onChange={(e) => updateItem(form.id, index, 'qty', e.target.value)}
                                  placeholder="Qty"
                                  min="1"
                                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateItem(form.id, index, 'price', e.target.value)}
                                  placeholder="Price"
                                  step="0.01"
                                  min="0"
                                  className="w-28 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {form.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(form.id, index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X size={20} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total Preview */}
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">₹{calculateTotals(form.items).subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Tax (10%):</span>
                            <span className="font-semibold">₹{calculateTotals(form.items).tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span>Grand Total:</span>
                            <span className="text-indigo-600">₹{calculateTotals(form.items).grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate All Button */}
                <button
                  type="button"
                  onClick={generateAllTokens}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Printer size={24} />
                  {loading ? 'Generating...' : `Generate & Print ${forms.length} Token(s)`}
                </button>
              </div>
            )}

            {/* By Date Tab */}
            {activeTab === 'byDate' && (
              <div>
                <div className="flex gap-4 mb-6">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={fetchTokensByDate}
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Loading...' : 'Search'}
                  </button>
                </div>

                <TokenList tokens={tokens} />
              </div>
            )}

            {/* All Tokens Tab */}
            {activeTab === 'all' && (
              <div>
                {loading && <p className="text-center text-gray-600">Loading...</p>}
                <TokenList tokens={tokens} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Token List Component
const TokenList = ({ tokens }) => {
  if (!tokens.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <List size={48} className="mx-auto mb-4 opacity-50" />
        <p>No tokens found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token) => {
        const totals = token.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
        const tax = totals * 0.1;
        const grandTotal = totals + tax;

        return (
          <div key={token._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Token #{token.tokenNumber}</h3>
                <p className="text-sm text-gray-600">{token.date} | {token.mealType}</p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                Table {token.tableNumber}
              </span>
            </div>

            <div className="border-t pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {token.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-right">{item.qty}</td>
                      <td className="py-2 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="py-2 text-right">₹{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 pt-3 border-t text-right space-y-1">
                <p className="text-sm text-gray-600">Subtotal: ₹{totals.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Tax (10%): ₹{tax.toFixed(2)}</p>
                <p className="font-bold text-lg text-indigo-600">Grand Total: ₹{grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App; 