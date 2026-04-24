import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, CalendarPlus } from 'lucide-react';
import './CreateEvent.css';

const CATEGORIES = ['Workshop', 'Hackathon', 'Course', 'Meetup', 'College Event', 'Outdoor'];

const CreateEvent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    date: '',
    time: '',
    coverImage: '',
    maxParticipants: 100,
    ticketPrice: 0,
    maxTeamSize: 10
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not logged in or not an organizer
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'organizer') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Default image if empty
      const payload = { ...formData };
      if (!payload.coverImage) {
        payload.coverImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
      }

      const { data } = await axios.post('http://localhost:5000/api/events', payload, config);
      navigate(`/events/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'organizer') return null;

  return (
    <div className="create-event-page animate-fade-in">
      <div className="container">
        <div className="form-container">
          <div className="form-header">
            <h1><CalendarPlus size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'text-bottom', color: 'var(--primary)' }} /> Create New Event</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Fill out the details below to publish your event to EventTribe.</p>
          </div>

          {error && (
            <div className="auth-error" style={{ marginBottom: '2rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="title">Event Title</label>
              <input type="text" id="title" className="form-input" value={formData.title} onChange={handleChange} required placeholder="e.g. Next.js Masterclass 2026" />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea id="description" className="form-input form-textarea" value={formData.description} onChange={handleChange} required placeholder="Tell people what this event is about..."></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select id="category" className="form-input" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="maxParticipants">Max Total Attendees</label>
              <input type="number" id="maxParticipants" className="form-input" value={formData.maxParticipants} onChange={handleChange} required min="1" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ticketPrice">Ticket Price ($)</label>
              <input type="number" id="ticketPrice" className="form-input" value={formData.ticketPrice} onChange={handleChange} required min="0" step="0.01" />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="maxTeamSize">Max Group/Team Size Option</label>
              <input type="number" id="maxTeamSize" className="form-input" value={formData.maxTeamSize} onChange={handleChange} required min="1" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input type="date" id="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="time">Time</label>
              <input type="time" id="time" className="form-input" value={formData.time} onChange={handleChange} required />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="coverImage">Cover Image URL (Optional)</label>
              <input type="url" id="coverImage" className="form-input" value={formData.coverImage} onChange={handleChange} placeholder="https://..." />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-submit full-width" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
