import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { eventsAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingTickets, setBookingTickets] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (isAuthenticated) {
      checkInterestedStatus();
      // Check if user just logged in and should proceed with booking
      const shouldProceedWithBooking = localStorage.getItem('pendingBooking');
      if (shouldProceedWithBooking === 'true') {
        localStorage.removeItem('pendingBooking');
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          handleBookEvent();
        }, 500);
      }
    }
  }, [id, isAuthenticated]);

  const checkInterestedStatus = async () => {
    try {
      const response = await eventsAPI.getInterestedEvents();
      if (response.success) {
        const isEventInterested = response.events.some((event) => event._id === id);
        setIsInterested(isEventInterested);
      }
    } catch (error) {
      console.error('Error checking interested status:', error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventById(id);
      if (response.success) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInterested = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (isInterested) {
        // Remove from interested
        const response = await eventsAPI.removeInterested(id);
        if (response.success) {
          setIsInterested(false);
          setEvent({ ...event, interestedCount: response.interestedCount });
        }
      } else {
        // Add to interested
        const response = await eventsAPI.markInterested(id);
        if (response.success) {
          setIsInterested(true);
          setEvent({ ...event, interestedCount: response.interestedCount });
        }
      }
    } catch (error) {
      console.error('Error marking interested:', error);
    }
  };

  const handleBookEvent = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      // Store redirect URL and booking intent
      localStorage.setItem('redirectAfterLogin', `/events/${id}`);
      localStorage.setItem('pendingBooking', 'true');
      setIsAuthModalOpen(true);
      return;
    }

    if (bookingTickets < 1) {
      setError('Please select at least 1 ticket');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      // Create Cashfree payment session
      const sessionResponse = await paymentAPI.createPaymentSession(id, bookingTickets);

      console.log('Payment session response:', sessionResponse);

      if (sessionResponse.success) {
        // If free event, booking is already confirmed
        if (sessionResponse.isFree) {
          setBookingSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          return;
        }

        // Validate payment session ID
        if (!sessionResponse.paymentSessionId) {
          console.error('Payment session ID missing:', sessionResponse);
          throw new Error('Payment session ID not received. Please try again.');
        }

        // Initialize Cashfree checkout
        if (window.Cashfree) {
          const cashfreeMode =
            (import.meta.env.VITE_CASHFREE_MODE ||
              (import.meta.env.MODE === 'production' ? 'production' : 'sandbox'))
              .toLowerCase();

          console.log('Initializing Cashfree checkout with:', {
            mode: cashfreeMode === 'production' ? 'production' : 'sandbox',
            paymentSessionId: sessionResponse.paymentSessionId,
          });

          const cashfree = window.Cashfree({
            mode: cashfreeMode === 'production' ? 'production' : 'sandbox',
          });

          cashfree.checkout({
            paymentSessionId: sessionResponse.paymentSessionId,
            redirectTarget: '_self',
          });
        } else {
          throw new Error('Cashfree SDK not loaded. Please refresh the page and try again.');
        }
      } else {
        throw new Error(sessionResponse.message || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
      setIsBooking(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}, ${dayNum} ${month} ${year}`;
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-gray-700">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">Event not found</p>
            <Link
              to="/events"
              className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200"
            >
              Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalPrice = event.price * bookingTickets;

  // Parse time string to Date
  const parseTimeString = (timeString, baseDate) => {
    if (!timeString) return null;
    const date = new Date(baseDate);
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [timePart, period] = timeString.trim().split(/\s*(AM|PM)/i);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      let hour24 = hours;
      if (period && period.toUpperCase() === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      date.setHours(hour24, minutes || 0, 0, 0);
    } else {
      const [hours, minutes] = timeString.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0, 0, 0);
    }
    
    return date;
  };

  // Check if event is past (using end time/date if available)
  const isEventPast = () => {
    if (!event || !event.date) return false;
    const now = new Date();

    // If endDate is provided, use it
    if (event.endDate) {
      const endDate = new Date(event.endDate);
      if (event.endTime) {
        const endDateTime = parseTimeString(event.endTime, endDate);
        return endDateTime ? now > endDateTime : now > endDate;
      }
      return now > endDate;
    }

    // If endTime is provided, use start date + endTime
    if (event.endTime) {
      const eventDate = new Date(event.date);
      const eventEndTime = parseTimeString(event.endTime, eventDate);
      return eventEndTime ? now > eventEndTime : false;
    }

    // Default: use start date + time
    if (event.time) {
      const eventDate = new Date(event.date);
      const eventStartTime = parseTimeString(event.time, eventDate);
      return eventStartTime ? now > eventStartTime : false;
    }

    // Fallback: just check date
    const eventDate = new Date(event.date);
    eventDate.setHours(23, 59, 59, 999);
    return now > eventDate;
  };

  // Check if booking is allowed (30 minutes before start)
  const isBookingAllowed = () => {
    if (!event || !event.date || !event.time) return false;
    
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventStartTime = parseTimeString(event.time, eventDate);
    
    if (!eventStartTime) return false;
    
    // Calculate 30 minutes before event start
    const bookingCloseTime = new Date(eventStartTime);
    bookingCloseTime.setMinutes(bookingCloseTime.getMinutes() - 30);
    
    // Check if current time is before booking close time
    return now < bookingCloseTime;
  };

  const eventIsPast = isEventPast();
  const bookingAllowed = isBookingAllowed();
  const bookingDisabled = eventIsPast || !bookingAllowed;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Event Image Banner - Responsive - Full Banner Visible */}
          <div className="mb-4 sm:mb-6 md:mb-8 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            <div className="relative w-full">
              {/* Mobile: Full height, maintain aspect ratio */}
              <div className="block sm:hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Image';
                  }}
                />
              </div>
              {/* Tablet: Full width, maintain aspect ratio */}
              <div className="hidden sm:block md:hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto object-contain max-h-[500px]"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Image';
                  }}
                />
              </div>
              {/* Desktop: Full width, maintain aspect ratio */}
              <div className="hidden md:block">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto object-contain max-h-[600px]"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Image';
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Title and Price */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">
                      {event.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <button
                        onClick={handleMarkInterested}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                          isInterested
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="whitespace-nowrap">I'm Interested</span>
                      </button>
                      <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-xs sm:text-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="whitespace-nowrap">Share</span>
                      </button>
                      <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-xs sm:text-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="whitespace-nowrap">Calendar</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-left md:text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Tickets from</p>
                    {event.price === 0 ? (
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">Free</p>
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {event.currency || 'INR'} {event.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* About the Event */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About the event</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 break-words">{event.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line break-words">
                  {event.description}
                </p>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{formatDate(event.date)}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{formatTime(event.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{event.location.venue}</p>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">{event.location.address}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{event.location.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Book Tickets</h3>
                
                {bookingDisabled ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {eventIsPast ? 'Event Has Passed' : 'Booking Closed'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {eventIsPast 
                        ? 'This event has already taken place. Booking is no longer available.'
                        : 'Booking closes 30 minutes before the event starts. This event is starting soon.'}
                    </p>
                    {eventIsPast && (
                      <Link
                        to="/events/past"
                        className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200"
                      >
                        View Past Events
                      </Link>
                    )}
                  </div>
                ) : bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Booking Successful!</p>
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Tickets
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setBookingTickets(Math.max(1, bookingTickets - 1))}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-2xl font-semibold text-gray-900 w-12 text-center">
                          {bookingTickets}
                        </span>
                        <button
                          onClick={() => setBookingTickets(bookingTickets + 1)}
                          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per ticket</span>
                        <span className="font-semibold text-gray-900">
                          {event.price === 0 ? 'Free' : `${event.currency || 'INR'} ${event.price}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#FFD700]">
                          {event.price === 0 ? 'Free' : `${event.currency || 'INR'} ${totalPrice}`}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleBookEvent}
                      disabled={isBooking}
                      className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                          Processing...
                        </span>
                      ) : (
                        'Find Tickets'
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By booking, you agree to our Terms & Conditions
                    </p>
                  </>
                )}
              </div>

              {/* Interested Section */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="flex -space-x-2 flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-900">
                      {event.interestedCount || 0}+
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 break-words">
                    {event.interestedCount || 0}+ people are Interested in this event, How about you?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkInterested}
                    className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${
                      isInterested
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    ✓ Yes
                  </button>
                  <button className="flex-1 py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all">
                    ✗ No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          localStorage.removeItem('pendingBooking');
        }}
        redirectAfterLogin={`/events/${id}`}
      />
    </>
  );
};

export default EventDetail;

