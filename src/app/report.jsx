import React, { useState } from "react";

export default function LocalMenuManager() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    date: "",
    breakfast: "",
    lunch: "",
    dinner: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) {
      setMessage("Please select a date.");
      return;
    }
    const existingIndex = menus.findIndex((m) => m.date === form.date);

    if (editMode) {
      if (existingIndex >= 0) {
        const updatedMenus = [...menus];
        updatedMenus[existingIndex] = { ...form };
        setMenus(updatedMenus);
        setMessage("Menu updated!");
      } else {
        setMessage("No existing menu found to update.");
      }
    } else {
      if (existingIndex >= 0) {
        setMessage("Menu already exists for this date.");
        return;
      }
      setMenus((prev) => [...prev, form]);
      setMessage("Menu added!");
    }
    setForm({ date: "", breakfast: "", lunch: "", dinner: "" });
    setEditMode(false);
  };

  const handleEdit = (menu) => {
    setForm(menu);
    setEditMode(true);
    setMessage("");
  };

  const handleCancel = () => {
    setForm({ date: "", breakfast: "", lunch: "", dinner: "" });
    setEditMode(false);
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Local Menu Manager</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="date">Date:</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
            disabled={editMode}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="breakfast">Breakfast:</label>
          <textarea
            name="breakfast"
            value={form.breakfast}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Enter breakfast menu"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="lunch">Lunch:</label>
          <textarea
            name="lunch"
            value={form.lunch}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Enter lunch menu"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="dinner">Dinner:</label>
          <textarea
            name="dinner"
            value={form.dinner}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Enter dinner menu"
            required
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            {editMode ? "Update Menu" : "Add Menu"}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="mt-3 text-red-600">{message}</p>}
      </form>

      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Your Menus</h3>
        {menus.length === 0 && <p>No menus added yet.</p>}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {menus
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((menu) => (
              <div key={menu.date} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">Date: {menu.date}</h4>
                  <button
                    onClick={() => handleEdit(menu)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p><strong>Breakfast:</strong> {menu.breakfast}</p>
                <p><strong>Lunch:</strong> {menu.lunch}</p>
                <p><strong>Dinner:</strong> {menu.dinner}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
