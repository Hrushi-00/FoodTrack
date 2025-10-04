import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // change if deployed

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", position: "", contact: "", salary: "" });
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/employees`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Employee added!");
      setForm({ name: "", position: "", contact: "", salary: "" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding employee");
    }
  };

  // Add leave
  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return alert("Select an employee first");
    try {
      await axios.post(`${API_URL}/employees/${selectedEmployee._id}/leaves`, leaveForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Leave added!");
      setLeaveForm({ startDate: "", endDate: "", reason: "" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding leave");
    }
  };

  // Add payment
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return alert("Select an employee first");
    try {
      await axios.post(`${API_URL}/employees/${selectedEmployee._id}/payments`, paymentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Payment recorded!");
      setPaymentForm({ amount: "", method: "" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding payment");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="space-y-3 bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold">Add Employee</h2>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Employee
        </button>
      </form>

      {/* Employee List */}
      <h2 className="text-xl font-semibold mb-2">Employees</h2>
      <ul className="space-y-2">
        {employees.map((emp) => (
          <li
            key={emp._id}
            className={`p-3 border rounded cursor-pointer ${
              selectedEmployee?._id === emp._id ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedEmployee(emp)}
          >
            <strong>{emp.name}</strong> - {emp.position} <br />
            Contact: {emp.contact} | Salary: ₹{emp.salary}
          </li>
        ))}
      </ul>

      {selectedEmployee && (
        <div className="mt-6 space-y-6">
          {/* Add Leave */}
          <form onSubmit={handleAddLeave} className="space-y-3 bg-gray-100 p-4 rounded">
            <h2 className="font-semibold">Add Leave for {selectedEmployee.name}</h2>
            <input
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <input
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Reason"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">
              Add Leave
            </button>
          </form>

          {/* Add Payment */}
          <form onSubmit={handleAddPayment} className="space-y-3 bg-gray-100 p-4 rounded">
            <h2 className="font-semibold">Add Payment for {selectedEmployee.name}</h2>
            <input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="border p-2 w-full"
              required
            >
              <option value="">Select Method</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
            </select>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Add Payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
