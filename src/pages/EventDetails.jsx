import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Users, User as UserIcon, Ticket, CheckCircle, ArrowLeft } from 'lucide-react';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [bookingMode, setBookingMode] = useState(false);
  const [teamSize, setTeamSize] = useState(1);
  const [participants, setParticipants] = useState([{ name: '', email: '', phone: '' }]);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(data);
        
        // Check if already registered
        if (user) {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const regRes = await axios.get('http://localhost:5000/api/registrations/my-registrations', config);
          const isRegistered = regRes.data.some(r => r.event._id === id);
          setRegistered(isRegistered);
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleTeamSizeChange = (e) => {
    const size = parseInt(e.target.value);
    const maxAllowed = Math.min(event.maxTeamSize || 10, event.maxParticipants - event.registeredCount);
    
    if (size >= 1 && size <= maxAllowed) {
      setTeamSize(size);
      
      const newParticipants = [...participants];
      if (size > newParticipants.length) {
        // Add new empty participants
        for (let i = newParticipants.length; i < size; i++) {
          newParticipants.push({ name: '', email: '', phone: '' });
        }
      } else {
        // Remove excess participants
        newParticipants.length = size;
      }
      setParticipants(newParticipants);
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Validate participants
    for (let i = 0; i < participants.length; i++) {
      if (!participants[i].name || !participants[i].email || !participants[i].phone) {
        setError(`Please fill all details for Participant ${i + 1}`);
        return;
      }
    }
    
    try {
      setRegistering(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { teamSize, participants };
      const { data } = await axios.post(`http://localhost:5000/api/registrations/${id}`, payload, config);
      
      setRegistered(true);
      
      // Navigate to confirmation page
      navigate(`/booking-confirmation/${data.registration._id}`);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading...</div>;
  if (!event) return <div style={{paddingTop: '100px', textAlign: 'center'}}>{error}</div>;

  const availableSeats = event.maxParticipants - event.registeredCount;
  const maxAllowed = Math.min(event.maxTeamSize || 10, availableSeats);

  return (
    <div className="event-details-page animate-fade-in">
      <div className="event-hero">
        <img src={event.coverImage} alt={event.title} className="event-hero-img" />
        <div className="event-hero-overlay"></div>
      </div>

      <div className="container" style={{ position: 'relative' }}>
        <div className="event-content-container">
          {/* Main Info */}
          <div className="event-main-info">
            <span className="event-d-category">{event.category}</span>
            <h1 className="event-d-title">{event.title}</h1>
            <div className="event-description">{event.description}</div>
          </div>

          {/* Sidebar Information */}
          <div className="event-sidebar">
            <div className="sidebar-box">
              <div className="detail-row">
                <div className="detail-icon"><CalendarIcon size={20} /></div>
                <div className="detail-text">
                  <h4>Date</h4>
                  <p>{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-icon"><Clock size={20} /></div>
                <div className="detail-text">
                  <h4>Time</h4>
                  <p>{event.time}</p>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-icon"><Ticket size={20} /></div>
                <div className="detail-text">
                  <h4>Price</h4>
                  <p>${event.ticketPrice || 0}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-box registration-card">
              {error && <p className="error-message">{error}</p>}
              
              {!bookingMode ? (
                <>
                  <div style={{marginBottom: '1.5rem'}}>
                    <span style={{fontSize: '2rem', fontWeight: 800, color: 'var(--primary)'}}>{availableSeats}</span>
                    <span style={{color: 'var(--text-secondary)'}}> spots left</span>
                  </div>

                  {registered ? (
                    <button className="btn btn-block" style={{backgroundColor: '#10B981', color: 'white', cursor: 'default'}}>
                      <CheckCircle size={18} /> Booked Successfully
                    </button>
                  ) : availableSeats > 0 ? (
                    <button className="btn btn-primary btn-block" onClick={() => {
                        if (!user) navigate('/login');
                        else setBookingMode(true);
                      }}>
                      <Ticket size={18} /> Book Tickets
                    </button>
                  ) : (
                    <button className="btn btn-block" disabled style={{backgroundColor: '#CBD5E1', color: 'white'}}>
                      Sold Out
                    </button>
                  )}
                </>
              ) : (
                <div className="booking-form-container fade-in">
                  <button className="back-btn" onClick={() => setBookingMode(false)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <h3 className="booking-form-title">Book Tickets</h3>
                  
                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <label>Number of Tickets</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={maxAllowed} 
                        value={teamSize} 
                        onChange={handleTeamSizeChange}
                        className="form-control"
                      />
                      <small style={{color: 'var(--text-secondary)'}}>Max {event.maxTeamSize || 10} per booking</small>
                    </div>

                    <div className="participants-list">
                      {participants.map((p, i) => (
                        <div key={i} className="participant-card">
                          <h5>Participant {i + 1}</h5>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={p.name}
                            onChange={(e) => handleParticipantChange(i, 'name', e.target.value)}
                            className="form-control"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={p.email}
                            onChange={(e) => handleParticipantChange(i, 'email', e.target.value)}
                            className="form-control"
                            required
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={p.phone}
                            onChange={(e) => handleParticipantChange(i, 'phone', e.target.value)}
                            className="form-control"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="booking-summary">
                      <div className="summary-row">
                        <span>{teamSize} × ${event.ticketPrice || 0}</span>
                        <span>${teamSize * (event.ticketPrice || 0)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total Amount</span>
                        <span>${teamSize * (event.ticketPrice || 0)}</span>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={registering}>
                      {registering ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
