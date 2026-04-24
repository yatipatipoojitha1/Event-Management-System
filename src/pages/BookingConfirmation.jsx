import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Calendar, MapPin, Clock, Download, ArrowLeft, Ticket } from 'lucide-react';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/registrations/${id}/tickets`, config);
        setTickets(data);
      } catch (err) {
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchTickets();
  }, [id, user]);

  const handleDownload = () => {
    // Basic print trick for now. A real app might generate a PDF using html2pdf.js or similar
    window.print();
  };

  if (loading) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading...</div>;
  if (!tickets || tickets.length === 0) return <div style={{paddingTop: '100px', textAlign: 'center'}}>{error || 'No tickets found'}</div>;

  const event = tickets[0].event;

  return (
    <div className="booking-confirmation-page container">
      <div className="confirmation-header text-center animate-fade-in">
        <CheckCircle size={64} className="success-icon" />
        <h1>Booking Confirmed!</h1>
        <p>Your tickets have been successfully generated for <strong>{event.title}</strong></p>
        
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-outline" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <button onClick={handleDownload} className="btn btn-primary" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
            <Download size={18} /> Download/Print Tickets
          </button>
        </div>
      </div>

      <div className="tickets-container">
        {tickets.map((ticket, index) => (
          <div key={ticket._id} className="ticket-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="ticket-left">
              <div className="ticket-brand">
                <Ticket size={24} /> EventTicket
              </div>
              <div className="ticket-event-info">
                <h2>{event.title}</h2>
                <div className="te-detail"><Calendar size={16} /> {format(new Date(event.date), 'EEE, MMM d, yyyy')}</div>
                <div className="te-detail"><Clock size={16} /> {event.time}</div>
                <div className="te-detail"><MapPin size={16} /> {event.venue}</div>
              </div>
              
              <div className="ticket-participant-info">
                <div className="info-block">
                  <span className="label">Participant</span>
                  <span className="value">{ticket.participantName}</span>
                </div>
                <div className="info-block">
                  <span className="label">Ticket Type</span>
                  <span className="value">General Admission</span>
                </div>
              </div>
            </div>
            
            <div className="ticket-divider"></div>
            
            <div className="ticket-right">
              <div className="qr-container">
                <img src={ticket.qrCode} alt="Ticket QR Code" />
              </div>
              <div className="ticket-id">
                {ticket._id.toString().slice(-8).toUpperCase()}
              </div>
              <p className="scan-text">Scan for entry</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingConfirmation;
