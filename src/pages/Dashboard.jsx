import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Ticket, Trash2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRegistrations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/registrations/my-registrations', config);
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [user, navigate]);

  const handleCancelRegistration = async (id) => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/registrations/${id}`, config);
        setRegistrations(registrations.filter(r => r._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel registration');
      }
    }
  };

  if (loading) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-avatar">{user.name.charAt(0)}</div>
          <div className="dashboard-user-info">
            <h1>{user.name}</h1>
            <p>{user.email} • {user.role === 'organizer' ? 'Event Organizer' : 'Event Attendee'}</p>
          </div>
        </div>

        <section className="dashboard-section">
          <h2><Ticket size={24} /> My Registered Events</h2>
          
          {registrations.length > 0 ? (
            <div className="registered-events-grid">
              {registrations.map((reg) => (
                <div key={reg._id} className="registration-card">
                  <img src={reg.event.coverImage} alt={reg.event.title} className="reg-card-img" />
                  <div className="reg-card-content">
                    <span className="reg-status">Confirmed</span>
                    <h3 className="reg-title">{reg.event.title}</h3>
                    <div className="reg-date">
                      <CalendarIcon size={14} />
                      {format(new Date(reg.event.date), 'MMM d, yyyy')} at {reg.event.time}
                    </div>
                    <div className="reg-actions">
                      <Link to={`/events/${reg.event._id}`} className="btn btn-outline btn-sm" style={{flex: 1}}>
                        View Event
                      </Link>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{color: '#DC2626', borderColor: '#FECACA'}}
                        onClick={() => handleCancelRegistration(reg._id)}
                        title="Cancel Registration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Registered Events Yet</h3>
              <p>You haven't registered for any events. Discover what's happening near you!</p>
              <Link to="/" className="btn btn-primary">Browse Events</Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
