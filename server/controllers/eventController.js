const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { isEventPast } = require('../utils/eventHelpers');

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    const {
      city,
      category,
      filter, // 'all', 'this-week', 'this-weekend', 'next-week', 'next-weekend', 'this-month'
      page = 1,
      limit = 12,
      search,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // City filter (optional - if not provided, show all cities)
    if (city && city.trim() !== '') {
      query['location.city'] = city;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.venue': { $regex: search, $options: 'i' } },
      ];
    }

    // Date filter
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'this-week':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        const dayOfWeek = now.getDay();
        const daysUntilSunday = 7 - dayOfWeek;
        endDate = new Date(now);
        endDate.setDate(now.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-weekend':
        startDate = new Date(now);
        const daysUntilSaturday = 6 - now.getDay();
        startDate.setDate(now.getDate() + daysUntilSaturday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'next-week':
        const nextMonday = new Date(now);
        const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + daysUntilNextMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'next-weekend':
        const nextSaturday = new Date(now);
        const daysUntilNextSaturday = (6 - now.getDay() + 7) % 7 || 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + daysUntilNextSaturday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        // 'all' - show all upcoming events (date >= today)
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Apply date filter - always show only upcoming events for this endpoint
    if (filter !== 'all' && startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // For 'all' and other cases, show only upcoming events
      query.date = { $gte: startDate };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query - get all matching events first
    let allEvents = await Event.find(query)
      .sort({ date: 1, createdAt: -1 });

    // Filter out past events (using end time/date if available)
    // Reuse the 'now' variable declared earlier in the function
    const upcomingEvents = allEvents.filter(event => {
      return !isEventPast(event);
    });

    // Apply pagination
    const total = upcomingEvents.length;
    const events = upcomingEvents.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event is not available',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message,
    });
  }
};

// @route   POST /api/events/:id/interested
// @desc    Mark event as interested
// @access  Private
const markInterested = async (req, res) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already interested
    const isAlreadyInterested = user.interestedEvents.includes(eventId);

    if (!isAlreadyInterested) {
      // Add to user's interested events
      user.interestedEvents.push(eventId);
      await user.save();

      // Increment interested count
      event.interestedCount += 1;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Marked as interested',
      interestedCount: event.interestedCount,
      isInterested: true,
    });
  } catch (error) {
    console.error('Mark interested error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking event as interested',
      error: error.message,
    });
  }
};

// @route   DELETE /api/events/:id/interested
// @desc    Remove event from interested
// @access  Private
const removeInterested = async (req, res) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove from user's interested events
    user.interestedEvents = user.interestedEvents.filter(
      (id) => id.toString() !== eventId
    );
    await user.save();

    // Decrement interested count
    if (event.interestedCount > 0) {
      event.interestedCount -= 1;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Removed from interested',
      interestedCount: event.interestedCount,
      isInterested: false,
    });
  } catch (error) {
    console.error('Remove interested error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing event from interested',
      error: error.message,
    });
  }
};

// @route   GET /api/events/interested/my
// @desc    Get user's interested events
// @access  Private
const getInterestedEvents = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate('interestedEvents');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out inactive events
    const activeInterestedEvents = user.interestedEvents.filter(
      (event) => event && event.isActive
    );

    res.json({
      success: true,
      events: activeInterestedEvents,
      count: activeInterestedEvents.length,
    });
  } catch (error) {
    console.error('Get interested events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interested events',
      error: error.message,
    });
  }
};

// @route   POST /api/events/:id/book
// @desc    Book event tickets
// @access  Private
const bookEvent = async (req, res) => {
  try {
    const { tickets, attendeeDetails, paymentMethod } = req.body;
    const userId = req.userId;

    if (!tickets || tickets < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of tickets is required',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for booking',
      });
    }

    // Check capacity
    if (event.maxCapacity && event.bookedCount + tickets > event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available',
      });
    }

    // Calculate total amount
    const totalAmount = event.price * tickets;

    // Create booking
    const booking = new Booking({
      user: userId,
      event: event._id,
      tickets,
      totalAmount,
      paymentMethod: paymentMethod || 'online',
      attendeeDetails: attendeeDetails || {},
      status: 'pending',
      paymentStatus: totalAmount === 0 ? 'paid' : 'pending',
    });

    await booking.save();

    // Update event booked count
    event.bookedCount += tickets;
    await event.save();

    // Populate event details for response
    await booking.populate('event', 'title date time location image');

    res.status(201).json({
      success: true,
      message: 'Event booked successfully',
      booking,
    });
  } catch (error) {
    console.error('Book event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking event',
      error: error.message,
    });
  }
};

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const bookings = await Booking.find({ user: userId })
      .populate('event', 'title date time endTime endDate location image price currency organizer')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

// @route   GET /api/bookings/:id/ticket
// @desc    Get ticket details for a booking
// @access  Private
const getTicketDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'user',
        select: 'name email mobile',
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Get raw booking to check event field value
    const rawBooking = await Booking.findById(bookingId).lean();
    const Event = require('../models/Event');
    let event = null;

    // Try to find event - check multiple possibilities
    if (rawBooking.event) {
      // Event field exists in database - try to find it
      const eventId = rawBooking.event.toString ? rawBooking.event.toString() : rawBooking.event;
      console.log('Looking up event with ID:', eventId);
      
      if (eventId && eventId.match(/^[0-9a-fA-F]{24}$/)) {
        event = await Event.findById(eventId)
          .select('title date time endTime endDate location image price currency organizer');
      }
    }

    // Log for debugging
    console.log('Event lookup result:', {
      bookingId: booking._id,
      rawEventField: rawBooking.event,
      eventFound: !!event,
      eventId: event?._id || 'not found',
    });

    // Log event lookup result
    console.log('Event lookup result:', {
      eventFound: !!event,
      eventId: event?._id || booking.event || 'null',
    });

    // Check if user exists
    if (!booking.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this booking.',
      });
    }

    // Check if booking belongs to the user
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This booking does not belong to you.',
      });
    }

    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found. This booking may be associated with a deleted event.',
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not available. Booking is not confirmed.',
      });
    }

    // Calculate gate closing time (30 minutes before event start)
    const { parseTimeString, isEventPast } = require('../utils/eventHelpers');
    
    // Validate event date and time
    if (!event.date || !event.time) {
      return res.status(400).json({
        success: false,
        message: 'Event date or time is missing. Cannot generate ticket.',
      });
    }

    const eventDate = new Date(event.date);
    const eventStartTime = parseTimeString(event.time, eventDate);
    
    if (!eventStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event time format. Cannot generate ticket.',
      });
    }

    const gateClosingTime = new Date(eventStartTime);
    gateClosingTime.setMinutes(gateClosingTime.getMinutes() - 30);

    // Check if event is past
    const eventIsPast = isEventPast(event);

    res.json({
      success: true,
      ticket: {
        booking: {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          tickets: booking.tickets,
          totalAmount: booking.totalAmount,
          currency: event.currency || 'INR',
          createdAt: booking.createdAt,
        },
        user: {
          name: booking.user.name || booking.attendeeDetails?.name || 'Guest',
          email: booking.user.email || booking.attendeeDetails?.email || '',
          mobile: booking.user.mobile || booking.attendeeDetails?.phone || '',
        },
        event: {
          title: event.title,
          date: event.date,
          time: event.time,
          endTime: event.endTime,
          endDate: event.endDate,
          location: event.location,
          image: event.image,
          organizer: event.organizer,
        },
        gateClosingTime: gateClosingTime,
        eventStartTime: eventStartTime,
        eventIsPast: eventIsPast,
      },
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details',
      error: error.message,
    });
  }
};

// @route   GET /api/events/past
// @desc    Get all past events
// @access  Public
const getPastEvents = async (req, res) => {
  try {
    const {
      city,
      category,
      page = 1,
      limit = 12,
      search,
    } = req.query;

    // Build query for past events
    const query = { isActive: true };
    
    // Get all active events first, then filter by end time/date
    // We'll filter in memory since MongoDB can't easily handle complex date+time logic

    // City filter (optional)
    if (city && city.trim() !== '') {
      query['location.city'] = city;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.venue': { $regex: search, $options: 'i' } },
      ];
    }

    // Get all events matching filters (before date filtering)
    let allEvents = await Event.find(query).sort({ date: -1, createdAt: -1 });

    // Filter past events based on end time/date
    const now = new Date();
    const pastEvents = allEvents.filter(event => {
      // Use helper function to check if event is past
      return isEventPast(event);
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = pastEvents.length;
    const events = pastEvents.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past events',
      error: error.message,
    });
  }
};

module.exports = {
  getAllEvents,
  getPastEvents,
  getEventById,
  markInterested,
  removeInterested,
  getInterestedEvents,
  bookEvent,
  getUserBookings,
  getTicketDetails,
};

