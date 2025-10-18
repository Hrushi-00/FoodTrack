import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
const ResetPassword = () => {
  const { token } = useParams(); // get token from URL
console.log("Reset token:", token);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setMessage("Passwords do not match");
    return;
  }

  try {
    setLoading(true);
    const { data } = await axios.post(`${API_URL}/auth/users/reset-password`, {
      token, // send token from URL
      password: formData.password,
    });

    setMessage(data.message || "Password reset successful!");
    // Navigate only after 2 seconds
    setTimeout(() => navigate("/"), 1000);
  } catch (error) {
    console.error(error);
    setMessage(
      error.response?.data?.message || "Something went wrong, please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-[400px]">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h2>

        {message && (
          <p
            className={`text-center mb-4 ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-200"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              placeholder="Confirm password"
              autoComplete="new-password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
