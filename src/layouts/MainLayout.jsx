import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from '../utils/auth.utils';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const user = getUser();

  // Dynamic header title based on current path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/batches':
        return 'Batches Management';
      case '/profile':
        return 'User Profile';
      default:
        return 'Dashboard';
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="https://res.cloudinary.com/doqbjnliq/image/upload/v1768821884/logo_oe6pjv.png"
            alt="Vidhyapat"
            className="mb-4"
            style={{ height: 36, objectFit: 'contain', width: 'fit-content' }}
          />        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/batches" className={({ isActive }) => (isActive ? 'active' : '')}>
                Batches
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h3>{getPageTitle()}</h3>
          </div>
          <div className="header-right">
            <div className="user-profile-container">
              <div
                className="user-profile"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{user?.name || user?.firstName || user?.email || 'Educator'}</span>
              </div>
              {showDropdown && (
                <div className="profile-dropdown">
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
