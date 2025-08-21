// In src/App.js
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from '../src/app/home';
import About from '../src/app/about';
import Contact from '../src/app/contact';
import AuthPage from '../src/components/Auth';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './app/sidebar';


function App() {
  return (  
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="Dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="home" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
        
      </BrowserRouter>
    </div>
  );
}

export default App;
