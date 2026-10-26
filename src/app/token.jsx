import React, { useState, useEffect } from 'react';
import { Plus, X, Printer, Trash2, Search } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;
const normalizeSearchText = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const App = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [menu, setMenu] = useState({ items: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchKey, setActiveSearchKey] = useState(null);
  
  //  localStorage 
  const [forms, setForms] = useState(() => {
    const savedForms = localStorage.getItem('multiTableForms');
    return savedForms ? JSON.parse(savedForms) : [
      {
        id: 1,
        tableNumber: '',
        items: [{ menuItemId: '', qty: 1 }]
      }
    ];
  });

  // Save forms to localStorage 
  useEffect(() => {
    localStorage.setItem('multiTableForms', JSON.stringify(forms));
  }, [forms]);

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMyMenu = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/getmenu`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMenu(data);
      } else {
        setMenu({ items: [] });
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search term
  const filteredMenuItems = menu.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.menuItemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMenuItemToFirstTable = (menuItem) => {
    setForms(prevForms => prevForms.map((form, index) => {
      if (index !== 0) return form;

      const emptyItemIndex = form.items.findIndex(item => !item.menuItemId);
      if (emptyItemIndex === -1) {
        return { ...form, items: [...form.items, { menuItemId: menuItem.menuItemId, qty: 1 }] };
      }

      return {
        ...form,
        items: form.items.map((item, itemIndex) => itemIndex === emptyItemIndex
          ? { ...item, menuItemId: menuItem.menuItemId }
          : item)
      };
    }));
    const firstTableLabel = forms[0]?.tableNumber || '1';
    showMessage('success', `${menuItem.name} added to Table ${firstTableLabel}`);
  };

  // Add new form
  const addNewForm = () => {
    const newForm = {
      id: Date.now(),
      tableNumber: '',
      items: [{ menuItemId: '', qty: 1 }]
    };
    setForms(prevForms => [...prevForms, newForm]);
  };

  // Remove form
  const removeForm = (formId) => {
    if (forms.length === 1) {
      showMessage('error', 'At least one table is required');
      return;
    }
    setForms(prevForms => prevForms.filter(f => f.id !== formId));
  };

  // Update form field
  const updateForm = (formId, field, value) => {
    setForms(prevForms => 
      prevForms.map(f => 
        f.id === formId ? { ...f, [field]: value } : f
      )
    );
  };

  // Add item to specific form
  const addItem = (formId) => {
    setForms(prevForms => 
      prevForms.map(f => 
        f.id === formId 
          ? { ...f, items: [...f.items, { menuItemId: '', qty: 1 }] }
          : f
      )
    );
  };

  // Remove item from specific form
  const removeItem = (formId, index) => {
    setForms(prevForms => 
      prevForms.map(f => 
        f.id === formId 
          ? { ...f, items: f.items.filter((_, i) => i !== index) }
          : f
      )
    );
  };

  // Update item in specific form
  const updateItem = (formId, index, field, value) => {
    setForms(prevForms => 
      prevForms.map(f => {
        if (f.id === formId) {
          const newItems = [...f.items];
                      newItems[index][field] = field === 'qty' ? parseInt(value) || 1 : value;
          return { ...f, items: newItems };
        }
        return f;
      })
    );
  };

  // Clear all forms data
  const clearAllForms = () => {
    if (window.confirm('Are you sure you want to clear all table data?')) {
      setForms([
        {
          id: 1,
          tableNumber: '',
          items: [{ menuItemId: '', qty: 1 }]
        }
      ]);
      showMessage('success', 'All table data cleared successfully');
    }
  };

  // Generate Single Token for a specific table
  const generateToken = async (formId) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    // Validate form
    if (!form.tableNumber) {
      showMessage('error', 'Please enter table number');
      return;
    }
    
    const hasEmptyItems = form.items.some(item => !item.menuItemId || item.qty <= 0);
    if (hasEmptyItems) {
      showMessage('error', 'Please enter menu item codes and quantities for table ' + form.tableNumber);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tokens/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          tableNumber: form.tableNumber,
          items: form.items.map(item => ({
            ...item,
            menuItemId: item.menuItemId.trim().toLowerCase()
          }))
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
          showMessage('error', 'Please allow popups for this site to view PDF tokens');
        } else {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        }
        
        showMessage('success', `Token for Table ${form.tableNumber} generated successfully!`);
        
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || `Failed to generate token for table ${form.tableNumber}`);
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load menu on component mount
  useEffect(() => {
    fetchMyMenu();
    // Fetch once when the token screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#035397] rounded-full mb-3">
            <Printer className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Token Generator
          </h1>
          <p className="text-gray-600 text-sm">
            Create meal tokens for multiple tables
          </p>
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

        {/* Control Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-800">Create table orders</h2>
              <p className="text-gray-500 text-sm mt-1">
                Step 1: enter table numbers and items. Step 2: generate and print. Orders auto-save.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearAllForms}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Clear All
              </button>
              <button
                onClick={addNewForm}
                className="px-4 py-2 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Table
              </button>
            </div>
          </div>
        </div>

        {/* Table Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {forms.map((form, formIndex) => (
            <div key={form.id} className="min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              {/* Form Header */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-[#035397] font-semibold text-sm">{formIndex + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Table {form.tableNumber || `#${formIndex + 1}`}</h3>
                </div>
                {forms.length > 1 && (
                  <button
                    onClick={() => removeForm(form.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                {/* Table Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={form.tableNumber}
                    onChange={(e) => updateForm(form.id, 'tableNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter table number"
                  />
                </div>

                {/* Menu Items Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Menu Items
                    </label>
                    <button
                      onClick={() => addItem(form.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.items.map((item, index) => {
                      const query = normalizeSearchText(item.menuItemId);
                      const searchKey = `${form.id}-${index}`;
                      const exactCodeMatch = query
                        ? menu.items.find(menuItem => normalizeSearchText(menuItem.menuItemId) === query)
                        : null;
                      const suggestions = query
                        ? exactCodeMatch
                          ? [exactCodeMatch]
                          : menu.items
                            .map(menuItem => {
                              const code = normalizeSearchText(menuItem.menuItemId);
                              const name = normalizeSearchText(menuItem.name);
                              const startsWithMatch = code.startsWith(query) || name.startsWith(query);
                              const containsMatch = code.includes(query) || name.includes(query);
                              return { menuItem, code, startsWithMatch, containsMatch };
                            })
                            .filter(result => result.containsMatch)
                            .sort((a, b) => Number(b.startsWithMatch) - Number(a.startsWithMatch))
                            .slice(0, 4)
                            .map(result => result.menuItem)
                        : [];

                      return (
                      <div key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_3.5rem_2rem] gap-2 items-center">
                        <div className="relative min-w-0">
                          <input
                            type="text"
                            value={item.menuItemId}
                            onChange={(e) => updateItem(form.id, index, 'menuItemId', e.target.value)}
                              onFocus={() => setActiveSearchKey(searchKey)}
                              onBlur={() => setActiveSearchKey(null)}
                            placeholder="Search item name or code"
                            autoComplete="off"
                            aria-label={`Search menu item for row ${index + 1}`}
                            className="min-w-0 w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                            {activeSearchKey === searchKey && suggestions.length > 0 && (
                              <div data-lenis-prevent className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                              {suggestions.map(menuItem => (
                                <button
                                  type="button"
                                  key={menuItem.menuItemId}
                                  onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      updateItem(form.id, index, 'menuItemId', menuItem.menuItemId);
                                      setActiveSearchKey(null);
                                    }}
                                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-blue-50"
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-gray-800">{menuItem.name}</span>
                                    <span className="text-xs text-gray-500">Code: {menuItem.menuItemId}</span>
                                  </span>
                                  <span className="shrink-0 text-xs font-semibold text-green-700">₹{menuItem.price.toFixed(2)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(form.id, index, 'qty', e.target.value)}
                          placeholder="Qty"
                          min="1"
                          aria-label={`Quantity for item ${index + 1}`}
                          className="min-w-0 w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {form.items.length > 1 && (
                          <button
                            onClick={() => removeItem(form.id, index)}
                            aria-label={`Remove item ${index + 1}`}
                            className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => generateToken(form.id)}
                  disabled={loading}
                  className="w-full py-3 bg-[#035397] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  {loading ? 'Generating token...' : 'Generate & Print Token'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Searchable menu picker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Menu items</h3>
              <p className="text-xs text-gray-500 mt-1">Select an item to add it to the first table above.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div data-lenis-prevent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2 w-[100%] max-h-40 overflow-y-auto">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <button
                  type="button"
                  key={item.menuItemId}
                  onClick={() => addMenuItemToFirstTable(item)}
                  title={`Add ${item.name} to the first table`}
                  className="text-left border border-gray-200 rounded-md p-2 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono font-bold text-blue-800 bg-blue-100 px-1 py-0.5 rounded text-xs">
                      {item.menuItemId}
                    </span>
                    <span className="font-bold text-green-600 text-sm">₹{item.price.toFixed(2)}</span>
                  </div>
                  <h4 className="font-medium text-gray-800 text-xs">{item.name}</h4>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                {searchTerm ? `No menu items found matching "${searchTerm}"` : 'No menu items available'}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-center text-xs text-gray-500">
            {filteredMenuItems.length} of {menu.items.length} menu item{menu.items.length !== 1 ? 's' : ''} shown
            {searchTerm && ` • Filtered by: "${searchTerm}"`}
          </div>
        </div>

        {/* Empty State */}
        {forms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Printer className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables configured</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first table</p>
            <button
              onClick={addNewForm}
              className="px-6 py-3 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add First Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
