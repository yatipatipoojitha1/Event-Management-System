import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event }) => {
  const availableSeats = event.maxParticipants - event.registeredCount;

  return (
    <div className="event-card animate-fade-in">
      <img src={event.coverImage} alt={event.title} className="event-card-image" />
      <div className="event-card-content">
        <span className="event-category">{event.category}</span>
        <h3 className="event-title">{event.title}</h3>
        
        <div className="event-details">
          <div className="event-detail-item">
            <CalendarIcon size={16} />
            <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="event-detail-item">
            <Clock size={16} />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="event-card-footer">
          <span className="seats-badge">
            <Users size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            {availableSeats > 0 ? `${availableSeats} seats left` : 'Sold out'}
          </span>
          <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 1rem' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
