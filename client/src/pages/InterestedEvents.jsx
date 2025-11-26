import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { eventsAPI } from '../services/api';

const InterestedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterestedEvents();
  }, []);

  const fetchInterestedEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getInterestedEvents();
      if (response.success) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Error fetching interested events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInterested = async (eventId) => {
    try {
      const response = await eventsAPI.removeInterested(eventId);
      if (response.success) {
        // Remove from local state
        setEvents(events.filter((event) => event._id !== eventId));
      }
    } catch (error) {
      console.error('Error removing interested:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day}, ${dayNum} ${month}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Interested Events & Plans</h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">You haven't marked any events as interested yet</p>
              <Link
                to="/events"
                className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <Link to={`/events/${event._id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                        }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/events/${event._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#FFD700] transition-colors">
                        {event.title}
                      </h3>
                    </Link>
                    <div className="space-y-1 mb-3 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)} • {formatTime(event.time)}
                      </p>
                      <p className="flex items-center gap-1 line-clamp-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location.venue}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        {event.price === 0 ? (
                          <span className="font-semibold text-green-600">Free</span>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {event.currency || 'INR'} {event.price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveInterested(event._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default InterestedEvents;
