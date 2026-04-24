import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import EventCard from '../components/EventCard';
import './Home.css';

const CATEGORIES = ['All', 'Workshop', 'Hackathon', 'Course', 'Meetup', 'College Event', 'Outdoor'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let queryUrl = 'http://localhost:5000/api/events?';
      if (category !== 'All') queryUrl += `category=${category}&`;
      if (appliedSearch) queryUrl += `search=${appliedSearch}&`;
      
      const { data } = await axios.get(queryUrl);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, appliedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchTerm);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in">
          <h1>Discover Amazing Events Near You</h1>
          <p>Join workshops, hackathons, meetups, and more.</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for events, workshops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container">
        {/* Filters */}
        <div className="filters-wrapper">
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`category-pill ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="controls-row">
            <h2 className="section-title">
              {category === 'All' ? 'Upcoming Events' : `${category}s`}
            </h2>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading events...</div>
        ) : (
          <div className="events-grid">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard key={event._id} event={event} />
              ))
            ) : (
              <div className="no-events">
                <h3>No events found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
