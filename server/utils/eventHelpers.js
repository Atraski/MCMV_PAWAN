/**
 * Helper functions for event-related operations
 */

/**
 * Parse time string to Date object
 * @param {String} timeString - Time in format "HH:MM" or "HH:MM AM/PM"
 * @param {Date} baseDate - Base date to attach time to
 * @returns {Date} Date object with time
 */
const parseTimeString = (timeString, baseDate) => {
  if (!timeString) return null;
  
  const date = new Date(baseDate);
  
  // Handle formats like "2:00 PM" or "14:00"
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
    // Handle 24-hour format "14:00"
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  }
  
  return date;
};

/**
 * Check if booking is allowed for an event
 * Booking closes 30 minutes before event start time
 * @param {Object} event - Event object
 * @returns {Object} { allowed: boolean, message: string }
 */
const isBookingAllowed = (event) => {
  if (!event || !event.date || !event.time) {
    return {
      allowed: false,
      message: 'Event date or time is missing',
    };
  }

  const now = new Date();
  const eventDate = new Date(event.date);
  const eventStartTime = parseTimeString(event.time, eventDate);

  if (!eventStartTime) {
    return {
      allowed: false,
      message: 'Invalid event time format',
    };
  }

  // Calculate 30 minutes before event start
  const bookingCloseTime = new Date(eventStartTime);
  bookingCloseTime.setMinutes(bookingCloseTime.getMinutes() - 30);

  // Check if current time is before booking close time
  if (now >= bookingCloseTime) {
    return {
      allowed: false,
      message: 'Booking closed. Event starts in less than 30 minutes.',
    };
  }

  return {
    allowed: true,
    message: 'Booking is allowed',
  };
};

/**
 * Check if event is past (ended)
 * Uses endDate if available, otherwise uses endTime, otherwise uses start date+time
 * @param {Object} event - Event object
 * @returns {boolean} True if event has ended
 */
const isEventPast = (event) => {
  if (!event || !event.date) {
    return false;
  }

  const now = new Date();

  // If endDate is provided, use it
  if (event.endDate) {
    const endDate = new Date(event.endDate);
    // If endTime is also provided, add it to endDate
    if (event.endTime) {
      const endDateTime = parseTimeString(event.endTime, endDate);
      return endDateTime ? now > endDateTime : now > endDate;
    }
    return now > endDate;
  }

  // If endTime is provided (but no endDate), use start date + endTime
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

module.exports = {
  parseTimeString,
  isBookingAllowed,
  isEventPast,
};









