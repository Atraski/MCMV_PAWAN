import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { eventsAPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getUserBookings();
      if (response.success) {
        setBookings(response.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Booking History</h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No bookings found</p>
              <Link
                to="/events"
                className="inline-block bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-6 py-2 rounded-lg transition-all duration-200"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.event?.title || 'Event'}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Booking Reference: {booking.bookingReference}</p>
                        <p>Tickets: {booking.tickets}</p>
                        <p>Total Amount: {booking.event?.currency || 'INR'} {booking.totalAmount}</p>
                        <p>Status: <span className={`font-semibold ${
                          booking.status === 'confirmed' ? 'text-green-600' :
                          booking.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>{booking.status}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                        <Link
                          to={`/ticket/${booking._id}`}
                          className="bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 font-medium px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          View Ticket
                        </Link>
                      )}
                      {booking.event && (
                        <Link
                          to={`/events/${booking.event._id}`}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-center"
                        >
                          View Event
                        </Link>
                      )}
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

export default BookingHistory;












