import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { eventsAPI } from '../services/api';

const PastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [city, setCity] = useState(''); // Empty means all cities

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'music', label: 'Music' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'art-theatre', label: 'Art & Theatre' },
    { value: 'food-drinks', label: 'Food & Drinks' },
    { value: 'business', label: 'Business' },
    { value: 'festivals', label: 'Festivals' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' },
  ];

  const priceFilters = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedPrice, city]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100, // Get more events to filter client-side if needed
      };
      
      // Only add city filter if city is selected
      if (city) {
        params.city = city;
      }
      
      // Only add category filter if not 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await eventsAPI.getPastEvents(params);
      if (response.success) {
        let filteredEvents = response.events;
        
        // Filter by price client-side
        if (selectedPrice === 'free') {
          filteredEvents = filteredEvents.filter(event => event.price === 0);
        } else if (selectedPrice === 'paid') {
          filteredEvents = filteredEvents.filter(event => event.price > 0);
        }
        
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error('Error fetching past events:', error);
    } finally {
      setLoading(false);
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
    // If time is in HH:MM format, convert to 12-hour format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  const isEventPast = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    return event < now;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Past Events
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Browse through our past events and relive the memories
          </p>
        </div>

        {/* Professional Filter Section - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 md:mb-8 bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Category Filter */}
            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Price
              </label>
              <div className="relative">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  {priceFilters.map((price) => (
                    <option key={price.value} value={price.value}>
                      {price.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* City Filter (Optional - can be added later) */}
            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="All Cities"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#FFD700]"></div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length === 0 && (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">No past events found.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {events.map((event) => {
              const isPast = isEventPast(event.date);
              
              return (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Event Image */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                      }}
                    />
                    {/* Past Event Badge */}
                    {isPast && (
                      <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                        Past Event
                      </div>
                    )}
                    {/* Star Icon */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement save functionality
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors active:scale-[0.98]"
                      aria-label="Save event"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="p-3 sm:p-4 md:p-5">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#FFD700] transition-colors">
                      {event.title}
                    </h3>

                    {/* Date & Time */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.date)} • {formatTime(event.time)}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <svg className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.location?.venue || 'Venue TBA'}</span>
                    </div>

                    {/* Footer - Interested & Price */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{event.interestedCount || 0}+ Interested</span>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {event.price === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          <span>{event.currency || 'INR'} {event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PastEvents;









