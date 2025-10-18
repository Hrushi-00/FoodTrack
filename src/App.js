// In src/App.js
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from '../src/app/home';
import Menu from '../src/app/menu';
import Contact from '../src/app/contact';
import AuthPage from '../src/components/Auth';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './app/sidebar';
import Report from './app/report';
import Settings from './app/settings';  
import Token from './app/token';
import Employees from './app/employee';
import TokenList from './app/tokenList';
import ResetPassword from './app/reset-password';
import EmployeeDetails from './app/employeeDetails'; // Fixed import path

function App() {
  return (  
    <div>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Routes with Dashboard Layout */}
          <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            {/* These will render inside the DashboardLayout's Outlet */}
            {/* Use relative paths (without leading slash) */}
            <Route path="dashboard" element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="contact" element={<Contact />} />
            <Route path="report" element={<Report />} />
            <Route path="settings" element={<Settings />} />
            <Route path="token" element={<Token />} />
            <Route path="employees" element={<Employees />} />
            <Route path="token-list" element={<TokenList />} />
            
            {/* Employee details route - use relative path */}
            <Route path="employees/:employeeId" element={<EmployeeDetails />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;