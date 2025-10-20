import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, X, Menu as MenuIcon } from 'lucide-react';
import { FaUtensils } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

const MenuManagement = () => {
  const [menu, setMenu] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editing, setEditing] = useState(false);
  const [isNewMenu, setIsNewMenu] = useState(false);

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Fetch current user's menu
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
        setIsNewMenu(data.items.length === 0);
      } else {
        setMenu({ items: [] });
        setIsNewMenu(true);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  // Add new menu item
  const addMenuItem = () => {
    setMenu(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { menuItemId: '', name: '', price: 0 }
      ]
    }));
  };

  // Remove menu item
  const removeMenuItem = (index) => {
    if (menu.items.length === 1) {
      showMessage('error', 'At least one menu item is required');
      return;
    }
    setMenu(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update menu item
  const updateMenuItem = (index, field, value) => {
    const newItems = [...menu.items];
    if (field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setMenu(prev => ({ ...prev, items: newItems }));
  };

  // Save menu (for new menu)
  const saveMenu = async () => {
    const hasEmptyFields = menu.items.some(item => 
      !item.menuItemId || !item.name || item.price <= 0
    );
    
    if (hasEmptyFields) {
      showMessage('error', 'Please fill all fields for all menu items');
      return;
    }

    const menuItemIds = menu.items.map(item => item.menuItemId);
    const uniqueIds = new Set(menuItemIds);
    if (uniqueIds.size !== menuItemIds.length) {
      showMessage('error', 'Menu item codes must be unique');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          items: menu.items
        })
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', data.message);
        setEditing(false);
        setIsNewMenu(false);
        fetchMyMenu();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to save menu');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update menu (for existing menu)
  const updateMenu = async () => {
    const hasEmptyFields = menu.items.some(item => 
      !item.menuItemId || !item.name || item.price <= 0
    );
    
    if (hasEmptyFields) {
      showMessage('error', 'Please fill all fields for all menu items');
      return;
    }

    const menuItemIds = menu.items.map(item => item.menuItemId);
    const uniqueIds = new Set(menuItemIds);
    if (uniqueIds.size !== menuItemIds.length) {
      showMessage('error', 'Menu item codes must be unique');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          items: menu.items
        })
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', data.message);
        setEditing(false);
        fetchMyMenu();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to update menu');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEditing = () => {
    setEditing(true);
    // If we have existing items, it's not a new menu
    if (menu.items.length > 0) {
      setIsNewMenu(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(false);
    fetchMyMenu();
  };

  // Load menu on component mount
  useEffect(() => {
    fetchMyMenu();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FaUtensils className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Menu Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your restaurant menu items
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

        {/* Menu Preview */}
        {!editing && menu.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Menu Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                      {item.menuItemId}
                    </span>
                    <span className="font-bold text-green-600 text-lg">₹{item.price.toFixed(2)}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              {menu.items.length} menu item{menu.items.length !== 1 ? 's' : ''} available for ordering
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Menu Items</h2>
              <p className="text-gray-600 text-sm mt-1">
                {menu.items.length} item{menu.items.length !== 1 ? 's' : ''} in menu
              </p>
            </div>
            
            <div className="flex gap-2">
              {!editing ? (
                <button
                  onClick={startEditing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={20} />
                  {menu.items.length === 0 ? 'Create Menu' : 'Edit Menu'}
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelEditing}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                  <button
                    onClick={isNewMenu ? saveMenu : updateMenu}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : (isNewMenu ? 'Save Menu' : 'Update Menu')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Add Item Button */}
          {editing && (
            <div className="mb-6">
              <button
                onClick={addMenuItem}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Menu Item
              </button>
            </div>
          )}

          {/* Menu Items List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading menu...</p>
            </div>
          ) : menu.items.length === 0 && !editing ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <MenuIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-4">No menu items found</p>
              <p className="text-gray-400 mb-6">Click "Create Menu" to start adding items to your menu</p>
              <button
                onClick={startEditing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Create Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {menu.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Menu Item Code */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Code
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={item.menuItemId}
                          onChange={(e) => updateMenuItem(index, 'menuItemId', e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-center"
                          placeholder="R1, C1"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg font-mono font-bold text-blue-800 text-center">
                          {item.menuItemId}
                        </div>
                      )}
                    </div>

                    {/* Item Name */}
                    <div className="lg:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter item name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-medium">
                          {item.name}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹)
                      </label>
                      {editing ? (
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-center font-bold text-green-800">
                          ₹{item.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex items-end justify-end gap-2">
                      {editing && (
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          {editing && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-3 text-lg">How to set up your menu:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="space-y-2">
                  <p><strong>Item Code:</strong> Short code used for ordering (e.g., R1, C1)</p>
                  <p><strong>Item Name:</strong> Full name that appears on tokens</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Price:</strong> Cost per item in rupees</p>
                  <p><strong>Unique Codes:</strong> Each item code must be different</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;