import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit, Trash2, Search } from 'lucide-react';
import { FaUtensils } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const MenuManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editing, setEditing] = useState(false);
  const [isNewMenu, setIsNewMenu] = useState(false);
  const [menu, setMenu] = useState({ items: [] });
  const [searchTerm, setSearchTerm] = useState('');

  // Get JWT token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Fetch menu from API
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

  // Filter menu items based on search term
  const filteredMenuItems = menu.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.menuItemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new menu
  const createNewMenu = () => {
    setIsNewMenu(true);
    setEditing(true);
    // Start with one empty item for new menus
    setMenu({ items: [{ menuItemId: '', name: '', price: 0 }] });
  };

  // Edit existing menu
  const editExistingMenu = () => {
    setIsNewMenu(false);
    setEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(false);
    if (isNewMenu) {
      // If we were creating a new menu, fetch the original data back
      fetchMyMenu();
    } else {
      // If we were editing existing menu, just reset editing mode
      setEditing(false);
    }
  };

  // Add new menu item
  const addMenuItem = () => {
    const newItem = {
      menuItemId: '',
      name: '',
      price: 0
    };
    setMenu(prevMenu => ({
      ...prevMenu,
      items: [...prevMenu.items, newItem]
    }));
  };

  // Update menu item
  const updateMenuItem = (index, field, value) => {
    setMenu(prevMenu => {
      const newItems = [...prevMenu.items];
      if (field === 'price') {
        newItems[index][field] = parseFloat(value) || 0;
      } else if (field === 'menuItemId') {
        newItems[index][field] = value.toLowerCase();
      } else {
        newItems[index][field] = value;
      }
      return { ...prevMenu, items: newItems };
    });
  };

  // Remove menu item
  const removeMenuItem = (index) => {
    if (menu.items.length === 1) {
      showMessage('error', 'At least one menu item is required');
      return;
    }
    setMenu(prevMenu => ({
      ...prevMenu,
      items: prevMenu.items.filter((_, i) => i !== index)
    }));
  };

  // Validate menu items
  const validateMenu = () => {
    // Check for empty fields
    const hasEmptyFields = menu.items.some(item => 
      !item.menuItemId.trim() || !item.name.trim() || item.price <= 0
    );
    
    if (hasEmptyFields) {
      showMessage('error', 'Please fill all fields and ensure price is greater than 0');
      return false;
    }

    // Check for duplicate menu item IDs
    const menuItemIds = menu.items.map(item => item.menuItemId);
    const uniqueIds = new Set(menuItemIds);
    if (uniqueIds.size !== menuItemIds.length) {
      showMessage('error', 'Menu item codes must be unique');
      return false;
    }

    return true;
  };

  // Save new menu
  const saveMenu = async () => {
    if (!validateMenu()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/createmenu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(menu)
      });

      if (response.ok) {
        showMessage('success', 'Menu created successfully!');
        setEditing(false);
        fetchMyMenu();
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.message || 'Failed to create menu');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing menu
  const updateMenu = async () => {
    if (!validateMenu()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/updatemenu`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(menu)
      });

      if (response.ok) {
        showMessage('success', 'Menu updated successfully!');
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

  // Load menu on component mount
  useEffect(() => {
    fetchMyMenu();
  }, []);

  // Separate button components for better organization
  const CreateMenuButton = ({ onCreate, disabled = false }) => (
    <button
      onClick={onCreate}
      disabled={disabled}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <Plus size={20} />
      Create New Menu
    </button>
  );

  const EditMenuButton = ({ onEdit, disabled = false }) => (
    <button
      onClick={onEdit}
      disabled={disabled}
      className="px-6 py-3 bg-[#035397] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <Edit size={20} />
      Edit Current Menu
    </button>
  );

  const SaveButton = ({ onSave, loading, isNewMenu }) => (
    <button
      onClick={onSave}
      disabled={loading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
    >
      <Save size={20} />
      {loading ? 'Saving...' : (isNewMenu ? 'Save New Menu' : 'Update Menu')}
    </button>
  );

  const CancelButton = ({ onCancel }) => (
    <button
      onClick={onCancel}
      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
    >
      <X size={20} />
      Cancel
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#035397] rounded-full mb-4">
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

        {/* Menu Preview with Search and Actions */}
        {!editing && menu.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Menu Preview</h3>
                
                {/* Search Input */}
                <div className="relative w-full max-w-md">
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

              {/* Action Buttons */}
              <div className="flex gap-2 w-full lg:w-auto">
                <CreateMenuButton 
                  onCreate={createNewMenu} 
                  disabled={loading}
                />
                <EditMenuButton 
                  onEdit={editExistingMenu} 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                        {item.menuItemId}
                      </span>
                      <span className="font-bold text-green-600 text-lg">₹{item.price.toFixed(2)}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {searchTerm ? `No menu items found matching "${searchTerm}"` : 'No menu items available'}
                </div>
              )}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              {filteredMenuItems.length} of {menu.items.length} menu item{menu.items.length !== 1 ? 's' : ''} shown
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header with Actions when editing or no menu */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Menu Items</h2>
              <p className="text-gray-600 text-sm mt-1">
                {menu.items.length} item{menu.items.length !== 1 ? 's' : ''} in menu
                {isNewMenu && editing && ' • Creating new menu'}
              </p>
            </div>
            
            {/* Action Buttons for when there's no menu or during editing */}
            {(editing || menu.items.length === 0) && (
              <div className="flex gap-2">
                {!editing ? (
                  <CreateMenuButton 
                    onCreate={createNewMenu} 
                    disabled={loading}
                  />
                ) : (
                  <div className="flex gap-2">
                    <CancelButton onCancel={cancelEditing} />
                    <SaveButton 
                      onSave={isNewMenu ? saveMenu : updateMenu}
                      loading={loading}
                      isNewMenu={isNewMenu}
                    />
                  </div>
                )}
              </div>
            )}
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
          {loading && !editing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#035397] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading menu...</p>
            </div>
          ) : menu.items.length === 0 && !editing ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FaUtensils size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-4">No menu items found</p>
              <p className="text-gray-400 mb-6">Click "Create New Menu" to start adding items to your menu</p>
              <CreateMenuButton onCreate={createNewMenu} />
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
                          onChange={(e) => updateMenuItem(index, 'menuItemId', e.target.value)}
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
              <h4 className="font-semibold text-blue-800 mb-3 text-lg">
                {isNewMenu ? 'Creating New Menu' : 'Editing Menu'} - Instructions:
              </h4>
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
              {isNewMenu && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    <strong>Note:</strong> You are creating a new menu. This will replace any existing menu.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;