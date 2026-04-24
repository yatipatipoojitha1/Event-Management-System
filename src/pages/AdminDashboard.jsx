import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Check, X } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllEvents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/events/admin/all', config);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching admin events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllEvents();
  }, [user, navigate]);

  const updateStatus = async (eventId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/events/${eventId}/status`, { status }, config);
      // Update local state
      setEvents(events.map(ev => ev._id === eventId ? { ...ev, status } : ev));
    } catch (error) {
      alert(error.response?.data?.message || `Failed to update status`);
    }
  };

  if (loading) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading Admin Panel...</div>;

  return (
    <div className="admin-page animate-fade-in">
      <div className="container">
        <div className="admin-header">
          <h1><ShieldCheck size={32} style={{ display: 'inline', color: 'var(--primary)', verticalAlign: 'text-bottom', marginRight: '8px' }}/> Admin Panel</h1>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No events found.</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event._id}>
                    <td style={{ fontWeight: 600 }}>{event.title}</td>
                    <td>{event.organizer?.name || 'Unknown'}</td>
                    <td>{format(new Date(event.date), 'MMM d, yyyy')}</td>
                    <td>
                      <span className={`status-badge status-${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      {event.status === 'pending' && (
                        <div className="action-btns">
                          <button 
                            className="btn btn-sm btn-approve"
                            onClick={() => updateStatus(event._id, 'approved')}
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-reject"
                            onClick={() => updateStatus(event._id, 'rejected')}
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
