import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Features from './pages/Features';
import Events from './pages/Events';
import PastEvents from './pages/PastEvents';
import EventDetail from './pages/EventDetail';
import News from './pages/News';
import Contact from './pages/Contact';
import About from './pages/About';
import MeetTheTeam from './pages/MeetTheTeam';
import BrandCollaboration from './pages/BrandCollaboration';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import UserDashboard from './pages/UserDashboard';
import BookingHistory from './pages/BookingHistory';
import InterestedEvents from './pages/InterestedEvents';
import Inbox from './pages/Inbox';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import AccountSettings from './pages/AccountSettings';
import AppDownload from './pages/AppDownload';
import Help from './pages/Help';
import UploadBanner from './pages/UploadBanner';
import PaymentCallback from './pages/PaymentCallback';
import TicketView from './pages/TicketView';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/past" element={<PastEvents />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/meet-the-team" element={<MeetTheTeam />} />
        <Route path="/brand-collaboration" element={<BrandCollaboration />} />
        <Route path="/auth/callback" element={<GoogleAuthCallback />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route
          path="/ticket/:bookingId"
          element={
            <ProtectedRoute>
              <TicketView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-history"
          element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interested-events"
          element={
            <ProtectedRoute>
              <InterestedEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-events"
          element={
            <ProtectedRoute>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/app" element={<AppDownload />} />
        <Route path="/help" element={<Help />} />
        <Route
          path="/upload-banner"
          element={
            <ProtectedRoute>
              <UploadBanner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

