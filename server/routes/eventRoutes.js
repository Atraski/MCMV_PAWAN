const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getPastEvents,
  getEventById,
  markInterested,
  removeInterested,
  getInterestedEvents,
  bookEvent,
  getUserBookings,
} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/past', getPastEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/:id/interested', authenticate, markInterested);
router.delete('/:id/interested', authenticate, removeInterested);
router.get('/interested/my', authenticate, getInterestedEvents);
router.post('/:id/book', authenticate, bookEvent);
router.get('/bookings/my', authenticate, getUserBookings);

module.exports = router;

