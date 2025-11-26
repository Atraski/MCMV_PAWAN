# Excel से Events Import करने की Guide

## 📋 Excel Sheet Format

आपके Excel sheet में निम्नलिखित columns होने चाहिए:

### Required Columns (जरूरी):
- **title** - Event का नाम
- **description** - Event की description
- **image** - Event image का URL (Cloudinary या कोई भी image URL)
- **date** - Event की date (format: YYYY-MM-DD या Excel date format)
- **time** - Event का time (format: HH:MM, जैसे 18:00)
- **venue** - Venue का नाम
- **address** - Complete address
- **city** - City name (default: Nagpur अगर नहीं दिया)

### Optional Columns (वैकल्पिक):
- **category** - Event category (entertainment, music, comedy, business, festivals, sports, art-theatre, food-drinks, other)
- **price** - Ticket price (number, 0 = free)
- **currency** - Currency code (default: INR)
- **maxCapacity** - Maximum attendees (number)
- **organizerName** - Organizer का नाम
- **organizerEmail** - Organizer का email
- **organizerPhone** - Organizer का phone
- **tags** - Tags (comma-separated, जैसे: "comedy,stand-up,entertainment")
- **isActive** - Event active है या नहीं (true/false, default: true)

## 📝 Excel Sheet Example

| title | description | image | date | time | venue | address | city | category | price | organizerName |
|-------|-------------|-------|------|------|-------|--------|------|----------|-------|---------------|
| Comedy Night | A night of laughter | https://... | 2025-12-01 | 19:00 | ABC Hall | Nagpur | Nagpur | comedy | 500 | Comedy Club |

## 🚀 कैसे Use करें:

### Step 1: Excel File तैयार करें
1. Excel में अपने events का data डालें
2. पहली row में column names होने चाहिए
3. File को save करें (`.xlsx` format में)

### Step 2: Import Script Run करें

Terminal में निम्नलिखित command run करें:

```bash
cd server
node scripts/importEventsFromExcel.js <excel-file-path>
```

**Example:**
```bash
# अगर Excel file project root में है
node scripts/importEventsFromExcel.js ../events.xlsx

# अगर Excel file server folder में है
node scripts/importEventsFromExcel.js ./events.xlsx

# Full path भी दे सकते हैं
node scripts/importEventsFromExcel.js "C:\Users\upawa\Desktop\events.xlsx"
```

### Step 3: Check करें
- Script successfully run होने के बाद events database में add हो जाएंगे
- Frontend पर `/events` page पर events दिखने लगेंगे
- Users booking कर सकेंगे

## ⚠️ Important Notes:

1. **Column Names**: Column names case-insensitive हैं, लेकिन exact match होना चाहिए
   - ✅ "title", "Title", "TITLE" - सभी काम करेंगे
   - ✅ "event title", "Event Title" - भी काम करेंगे

2. **Date Format**: 
   - Excel date format (जैसे 45234) - automatically parse होगा
   - String format (YYYY-MM-DD) - भी काम करेगा
   - Example: "2025-12-01" या Excel date serial number

3. **Time Format**:
   - HH:MM format (जैसे "19:00", "18:30")
   - Excel time format भी काम करेगा

4. **Image URLs**: 
   - Cloudinary URLs use करें (जैसे: `https://res.cloudinary.com/...`)
   - या कोई भी valid image URL

5. **Price**: 
   - Number format में होना चाहिए
   - 0 = Free event
   - Currency symbols (₹, $) automatically remove हो जाएंगे

## 🔍 Troubleshooting:

### Error: "File not found"
- Excel file का path सही है या नहीं check करें
- Full path use करें अगर relative path काम नहीं कर रहा

### Error: "Column not found"
- Column names सही हैं या नहीं check करें
- Script console में दिखाएगा कि कौन सा column मिला और कौन सा नहीं

### Events Import नहीं हो रहे
- Excel file में data rows हैं या नहीं check करें
- Required fields (title, date) भरे हुए हैं या नहीं check करें
- Console में error messages देखें

## 📞 Support

अगर कोई problem आए तो:
1. Console में error messages check करें
2. Excel file format verify करें
3. Required columns सही हैं या नहीं check करें










