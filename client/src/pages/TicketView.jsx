import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { eventsAPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

const TicketView = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketDetails();
  }, [bookingId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventsAPI.getTicketDetails(bookingId);
      if (response.success && response.ticket) {
        setTicket(response.ticket);
      } else {
        setError(response.message || 'Failed to load ticket. The event may have been deleted.');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      const errorMessage = err.message || 'Failed to load ticket details';
      setError(errorMessage.includes('Event not found') || errorMessage.includes('deleted') 
        ? 'This ticket is no longer available. The associated event may have been removed.'
        : errorMessage
      );
    } finally {
      setLoading(false);
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

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
          <Navbar />
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !ticket) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
          <Navbar />
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
              <button
                onClick={() => navigate('/booking-history')}
                className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200"
              >
                Back to Booking History
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Print Button - Hidden when printing */}
          <div className="mb-6 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Ticket
            </button>
          </div>

          {/* Professional Ticket Design */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
            {/* Ticket Header - Golden Gradient */}
            <div className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] p-6 sm:p-8 text-center relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  My City My Voice
                </h1>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  Event Ticket
                </p>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-6 sm:p-8 md:p-10">
              {/* Past Event Notice */}
              {ticket.eventIsPast && (
                <div className="mb-6 bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-gray-500 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">This event has already taken place</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">This is a record of your past booking</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Image and Title */}
              <div className="mb-6 sm:mb-8">
                <div className="rounded-xl overflow-hidden mb-4 shadow-lg">
                  <img
                    src={ticket.event.image}
                    alt={ticket.event.title}
                    className="w-full h-48 sm:h-64 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image';
                    }}
                  />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {ticket.event.title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Booking Reference: <span className="font-semibold text-gray-900">{ticket.booking.bookingReference}</span>
                </p>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Attendee Information */}
                  <div className="bg-gradient-to-br from-[#FFF8DC] to-white rounded-xl p-4 sm:p-6 border-2 border-[#FFD700]/20">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Attendee Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{ticket.user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Contact Number</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.user.mobile ? `+91 ${ticket.user.mobile}` : 'N/A'}
                        </p>
                      </div>
                      {ticket.user.email && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">{ticket.user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Date & Time */}
                  <div className="bg-gradient-to-br from-[#FFF8DC] to-white rounded-xl p-4 sm:p-6 border-2 border-[#FFD700]/20">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Event Date & Time
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Date</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {formatDate(ticket.event.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Start Time</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {formatTime(ticket.eventStartTime)}
                        </p>
                      </div>
                      {ticket.event.endTime && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">End Time</p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {ticket.event.endTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Venue Details */}
                  <div className="bg-gradient-to-br from-[#FFF8DC] to-white rounded-xl p-4 sm:p-6 border-2 border-[#FFD700]/20">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Venue Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Venue</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.event.location.venue}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.event.location.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">City</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.event.location.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Important Information */}
                  <div className={`rounded-xl p-4 sm:p-6 border-2 ${
                    ticket.eventIsPast 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' 
                      : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                  }`}>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${ticket.eventIsPast ? 'text-gray-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Important Information
                    </h3>
                    <div className="space-y-3">
                      {!ticket.eventIsPast && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Gate Closing Time</p>
                          <p className="text-base sm:text-lg font-bold text-red-600">
                            {formatTime(ticket.gateClosingTime)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            (30 minutes before event start)
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Number of Tickets</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.booking.tickets} {ticket.booking.tickets === 1 ? 'Ticket' : 'Tickets'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {ticket.booking.currency} {ticket.booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="border-t-2 border-dashed border-gray-300 pt-6 sm:pt-8 mt-6 sm:mt-8">
                <div className="text-center space-y-2">
                  {!ticket.eventIsPast ? (
                    <>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Please arrive at least 30 minutes before the event start time
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Present this ticket at the venue for entry
                      </p>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600 italic">
                      This ticket is for reference purposes only. The event has already concluded.
                    </p>
                  )}
                  {ticket.event.organizer && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-4">
                      Organized by: <span className="font-semibold">{ticket.event.organizer.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Bottom Border - Golden */}
            <div className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] h-2"></div>
          </div>

          {/* Back Button */}
          <div className="mt-6 print:hidden text-center">
            <button
              onClick={() => navigate('/booking-history')}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
            >
              Back to Booking History
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default TicketView;

