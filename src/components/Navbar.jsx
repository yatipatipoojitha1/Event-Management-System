import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, LogOut, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar animate-fade-in">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Calendar className="logo-icon" size={28} />
          <span className="gradient-text">EventTribe</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Events</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{color: 'var(--primary)', fontWeight: '700'}}>Admin Panel</Link>
              )}
              {user.role === 'organizer' && (
                <Link to="/create-event" className="btn btn-primary btn-sm">Create Event</Link>
              )}
              <div className="nav-user">
                <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-icon" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
        <button className="mobile-menu-btn"><Menu size={24} /></button>
      </div>
    </nav>
  );
};

export default Navbar;
