const mongoose = require('mongoose');
const XLSX = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Event = require('../models/Event');

/**
 * Download Google Sheets as Excel file
 * Google Sheets URL should be in format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
 * Export URL format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=xlsx
 */
async function downloadGoogleSheet(sheetUrl, outputPath) {
  return new Promise((resolve, reject) => {
    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      reject(new Error('Invalid Google Sheets URL. Please provide a valid Google Sheets URL.'));
      return;
    }
    
    const sheetId = sheetIdMatch[1];
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&gid=0`;
    
    console.log(`📥 Downloading Google Sheet from: ${exportUrl}`);
    
    const file = fs.createWriteStream(outputPath);
    
    const makeRequest = (url, maxRedirects = 5) => {
      if (maxRedirects === 0) {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(new Error('Too many redirects'));
        return;
      }

      https.get(url, { followRedirect: false }, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded to: ${outputPath}`);
            resolve(outputPath);
          });
          file.on('error', (err) => {
            file.close();
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
            reject(err);
          });
        } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
          // Handle redirect
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            file.close();
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
            reject(new Error('Redirect location not found'));
            return;
          }
          console.log(`🔄 Following redirect to: ${redirectUrl}`);
          makeRequest(redirectUrl, maxRedirects - 1);
        } else {
          file.close();
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        }
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(err);
      });
    };

    makeRequest(exportUrl);
  });
}

/**
 * Maps Excel column names to Event model fields
 */
const columnMapping = {
  // Required fields - Exact match from your Google Sheet
  title: ['title', 'Title'],
  fullDescription: ['full description', 'Full description', 'description', 'Description'],
  shortDescription: ['short description', 'Short description'],
  image: ['banner image', 'Banner image', 'image', 'Image', 'image url', 'Image URL'],
  startDate: ['start date', 'Start date', 'date', 'Date'],
  startTime: ['start time', 'Start time', 'time', 'Time'],
  endDate: ['end date', 'End date'],
  endTime: ['end time', 'End time'],
  
  // Location fields
  venue: ['venue name', 'Venue name', 'venue', 'Venue'],
  address: ['address', 'Address'],
  city: ['city', 'City'],
  state: ['state', 'State'],
  pincode: ['pincode', 'Pincode'],
  
  // Other fields
  category: ['category', 'Category'],
  isPaidEvent: ['is paid event?', 'Is paid event?', 'is paid event', 'Is paid event'],
  basePrice: ['base price', 'Base price', 'price', 'Price', 'ticket price', 'Ticket Price'],
  currency: ['currency', 'Currency'],
  maxCapacity: ['max capacity', 'capacity', 'maxcapacity', 'Max Capacity', 'Capacity'],
  eventMode: ['event mode', 'Event mode'],
  
  // Organizer fields
  organizerName: ['organizer', 'organizer name', 'Organizer', 'Organizer Name'],
  organizerEmail: ['organizer email', 'email', 'Email', 'Organizer Email'],
  organizerPhone: ['organizer phone', 'phone', 'Phone', 'Organizer Phone'],
  
  // Optional fields
  tags: ['tags', 'tag', 'Tags', 'Tag'],
  isActive: ['is active', 'active', 'Is Active', 'Active'],
};

/**
 * Find column index by checking multiple possible column names
 */
function findColumn(headerRow, possibleNames) {
  for (let i = 0; i < headerRow.length; i++) {
    const cellValue = String(headerRow[i] || '').trim().toLowerCase();
    for (const name of possibleNames) {
      if (cellValue === name.toLowerCase()) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Parse date from various formats (including "November 23, 2025" format)
 */
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a number (Excel date serial number)
  if (typeof dateValue === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(dateValue);
    // Convert to Date object
    if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
      return new Date(dateObj.y, dateObj.m - 1, dateObj.d);
    }
    // Fallback: Excel date serial number (days since 1900-01-01)
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch is 1900-01-01, but JS Date is 0-indexed for months
    const days = Math.floor(dateValue);
    const date = new Date(excelEpoch);
    date.setDate(date.getDate() + days);
    return date;
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const cleaned = dateValue.trim();
    
    // Handle "Sunday, 23rd Nov 2025" or "November 23, 2025" format
    // Remove ordinal suffixes (st, nd, rd, th)
    const cleanedDate = cleaned.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
    
    // Try parsing the cleaned date
    const date = new Date(cleanedDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try original string
    const date2 = new Date(dateValue);
    if (!isNaN(date2.getTime())) {
      return date2;
    }
  }
  
  return null;
}

/**
 * Parse time from various formats (including "2:00 PM" format)
 */
function parseTime(timeValue) {
  if (!timeValue) return '00:00';
  
  // If it's a number (Excel time serial number - fraction of a day)
  if (typeof timeValue === 'number') {
    // Excel stores time as fraction of day (0.5 = noon, 0.75 = 6 PM)
    const totalSeconds = Math.floor(timeValue * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // If it's a string, try to parse it
  if (typeof timeValue === 'string') {
    // Remove extra spaces
    const cleaned = timeValue.trim();
    
    // Handle "2:00 PM- 5:00 PM" format - take first time
    const timeRangeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeRangeMatch) {
      let hours = parseInt(timeRangeMatch[1]);
      const minutes = timeRangeMatch[2];
      const ampm = timeRangeMatch[3].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
    
    // Handle "2:00 PM" format
    const singleTimeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (singleTimeMatch) {
      let hours = parseInt(singleTimeMatch[1]);
      const minutes = singleTimeMatch[2];
      const ampm = singleTimeMatch[3].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
    
    // If it's in HH:MM format, return as is
    if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
      return cleaned;
    }
    
    // Try to parse as date and extract time
    const date = new Date(`2000-01-01 ${cleaned}`);
    if (!isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  
  return '00:00';
}

/**
 * Parse category and map to valid enum value
 */
function parseCategory(categoryValue) {
  if (!categoryValue) return 'entertainment';
  
  const categoryMap = {
    'entertainment': 'entertainment',
    'art-theatre': 'art-theatre',
    'art & theatre': 'art-theatre',
    'art and theatre': 'art-theatre',
    'food-drinks': 'food-drinks',
    'food & drinks': 'food-drinks',
    'food and drinks': 'food-drinks',
    'business': 'business',
    'festivals': 'festivals',
    'sports': 'sports',
    'music': 'music',
    'comedy': 'comedy',
    'open-mic': 'entertainment', // Map Open-Mic to entertainment
    'open mic': 'entertainment',
    'other': 'other',
  };
  
  const normalized = String(categoryValue).trim().toLowerCase();
  return categoryMap[normalized] || 'entertainment';
}

/**
 * Parse price - handles both single price and "performer/audience" format
 */
function parsePrice(priceValue, isPaidEvent) {
  // If event is not paid, return 0
  if (isPaidEvent === false || String(isPaidEvent).toLowerCase() === 'no') {
    return 0;
  }
  
  if (!priceValue) return 0;
  
  if (typeof priceValue === 'number') return priceValue;
  
  if (typeof priceValue === 'string') {
    // Check if it's in format "300 (performer) 100 (audience)" or similar
    const audienceMatch = priceValue.match(/(\d+)\s*\(audience\)/i);
    if (audienceMatch) {
      return parseFloat(audienceMatch[1]);
    }
    
    // Check for performer price
    const performerMatch = priceValue.match(/(\d+)\s*\(performer\)/i);
    if (performerMatch) {
      return parseFloat(performerMatch[1]);
    }
    
    // Try to extract first number found
    const numberMatch = priceValue.match(/(\d+)/);
    if (numberMatch) {
      return parseFloat(numberMatch[1]);
    }
    
    // Remove currency symbols and spaces
    const cleaned = priceValue.replace(/[₹$€£,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Parse is paid event
 */
function parseIsPaidEvent(isPaidValue) {
  if (!isPaidValue) return false;
  const normalized = String(isPaidValue).trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
}

/**
 * Parse tags (comma-separated string or array)
 */
function parseTags(tagsValue) {
  if (!tagsValue) return [];
  if (Array.isArray(tagsValue)) return tagsValue.map(t => String(t).trim()).filter(t => t);
  if (typeof tagsValue === 'string') {
    return tagsValue.split(',').map(t => t.trim()).filter(t => t);
  }
  return [];
}

/**
 * Import events from Google Sheets
 */
async function importEventsFromGoogleSheets(googleSheetsUrl) {
  try {
    // Connect to MongoDB
    let mongoURI = process.env.MONGO_URI.trim();
    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Download Google Sheet as Excel
    const tempFilePath = path.join(__dirname, 'temp_events.xlsx');
    await downloadGoogleSheet(googleSheetsUrl, tempFilePath);

    // Read Excel file
    console.log(`📖 Reading Excel file: ${tempFilePath}`);
    const workbook = XLSX.readFile(tempFilePath);
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    if (data.length < 2) {
      console.error('❌ Google Sheet must have at least a header row and one data row');
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      process.exit(1);
    }

    // First row is header
    const headerRow = data[0];
    console.log('📋 Header row:', headerRow);

    // Find column indices
    const columnIndices = {};
    for (const [field, possibleNames] of Object.entries(columnMapping)) {
      const index = findColumn(headerRow, possibleNames);
      if (index !== -1) {
        columnIndices[field] = index;
        console.log(`✅ Found column "${field}" at index ${index}: "${headerRow[index]}"`);
      } else {
        console.log(`⚠️  Column "${field}" not found (will use default value)`);
      }
    }

    // Process data rows
    const events = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }

      try {
        // Extract values
        const getValue = (field) => {
          const index = columnIndices[field];
          return index !== undefined && index < row.length ? row[index] : null;
        };

        // Build event object
        const isPaidEvent = parseIsPaidEvent(getValue('isPaidEvent'));
        const fullDesc = getValue('fullDescription');
        const shortDesc = getValue('shortDescription');
        const description = fullDesc || shortDesc || 'No description available';
        
        // Build address with state and pincode if available
        let fullAddress = getValue('address') || 'Address TBA';
        const state = getValue('state');
        const pincode = getValue('pincode');
        
        // Only add state if not already in address
        if (state && !fullAddress.includes(state)) {
          fullAddress += `, ${state}`;
        }
        // Only add pincode if not already in address
        if (pincode && !fullAddress.includes(pincode)) {
          fullAddress += ` ${pincode}`;
        }
        
        // Parse end date and end time
        const endDateValue = getValue('endDate');
        const endTimeValue = getValue('endTime');
        const parsedEndDate = endDateValue ? parseDate(endDateValue) : null;
        const parsedEndTime = endTimeValue ? parseTime(endTimeValue) : null;
        
        const eventData = {
          title: getValue('title'),
          description: description,
          image: getValue('image') || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
          date: parseDate(getValue('startDate')),
          time: parseTime(getValue('startTime')),
          endTime: parsedEndTime,
          endDate: parsedEndDate,
          location: {
            venue: getValue('venue') || 'TBA',
            address: fullAddress,
            city: getValue('city') || 'Nagpur',
          },
          category: parseCategory(getValue('category')),
          price: parsePrice(getValue('basePrice'), isPaidEvent),
          currency: getValue('currency') || 'INR',
          maxCapacity: getValue('maxCapacity') ? parseInt(getValue('maxCapacity')) : null,
          organizer: {
            name: getValue('organizerName') || 'MyCityMyVoice',
            email: getValue('organizerEmail') || '',
            phone: getValue('organizerPhone') || '',
          },
          tags: parseTags(getValue('tags')),
          isActive: getValue('isActive') !== false && getValue('isActive') !== 'false' && getValue('isActive') !== 0 && getValue('isActive') !== 'No',
        };

        // Validate required fields
        if (!eventData.title) {
          console.log(`⚠️  Row ${i + 1}: Skipping - missing title`);
          errorCount++;
          continue;
        }

        if (!eventData.date) {
          console.log(`⚠️  Row ${i + 1}: Skipping - missing or invalid date`);
          errorCount++;
          continue;
        }

        events.push(eventData);
        successCount++;
        console.log(`✅ Row ${i + 1}: "${eventData.title}" - Ready to import`);

      } catch (error) {
        console.error(`❌ Row ${i + 1}: Error processing - ${error.message}`);
        errorCount++;
      }
    }

    if (events.length === 0) {
      console.log('❌ No valid events found to import');
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      process.exit(1);
    }

    // Smart import: Update existing events or insert new ones
    console.log(`\n📥 Processing ${events.length} events (updating existing or adding new)...`);
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const eventData of events) {
      try {
        // Try to find existing event by title (case-insensitive)
        const existingEvent = await Event.findOne({
          title: { $regex: new RegExp(`^${eventData.title}$`, 'i') },
          date: eventData.date
        });

        if (existingEvent) {
          // Update existing event
          Object.assign(existingEvent, eventData);
          await existingEvent.save();
          updatedCount++;
          console.log(`🔄 Updated: "${eventData.title}"`);
        } else {
          // Insert new event
          const newEvent = new Event(eventData);
          await newEvent.save();
          insertedCount++;
          console.log(`➕ Added: "${eventData.title}"`);
        }
      } catch (error) {
        console.error(`❌ Error processing "${eventData.title}": ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Import Complete!`);
    console.log(`   ➕ New events added: ${insertedCount}`);
    console.log(`   🔄 Existing events updated: ${updatedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount + errorCount}`);

    // Display summary
    console.log('\n📊 Import Summary:');
    console.log(`   Total rows processed: ${data.length - 1}`);
    console.log(`   New events added: ${insertedCount}`);
    console.log(`   Events updated: ${updatedCount}`);
    console.log(`   Errors/Skipped: ${skippedCount + errorCount}`);

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('🧹 Cleaned up temporary file');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing events:', error);
    process.exit(1);
  }
}

// Get Google Sheets URL from command line argument
const googleSheetsUrl = process.argv[2];

if (!googleSheetsUrl) {
  console.log('📝 Usage: node importEventsFromGoogleSheets.js <google-sheets-url>');
  console.log('   Example: node importEventsFromGoogleSheets.js "https://docs.google.com/spreadsheets/d/1ABC123.../edit"');
  console.log('\n📋 Expected Google Sheet columns (case-insensitive):');
  console.log('   Required: Title, Full description (or Short description), Banner image, Start date, Start time, Venue name, Address, City');
  console.log('   Optional: Category, Is paid event?, Base price, State, Pincode, End date, End time, Event mode, Max Capacity, Organizer Name, Organizer Email, Organizer Phone, Tags, Is Active');
  process.exit(1);
}

importEventsFromGoogleSheets(googleSheetsUrl);

