// In src/App.js
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from '../src/app/home';
import About from '../src/app/about';
import Contact from '../src/app/contact';
import AuthPage from '../src/components/Auth';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './app/sidebar';
import Report from './app/report';
import Settings from './app/settings';  
import Token from './app/token';
import Employees from './app/employee';

function App() {
  return (  
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/" element={<PrivateRoute><DashboardLayout />
          </PrivateRoute>}>
              <Route path="dashboard" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="report" element={<Report />} />
              <Route path="settings" element={<Settings />} />
              <Route path="token" element={<Token />} />
              <Route path="employees" element={<Employees />} />
             
          
          </Route>
        </Routes>
        
      </BrowserRouter>
    </div>
  );
}

export default App;
