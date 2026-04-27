import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();

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
            <div className="user-profile">
              <span>Educator user</span>
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
