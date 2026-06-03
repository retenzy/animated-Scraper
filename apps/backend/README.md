# Amazon Reviews Backend API

Simple Express.js backend for CSV generation from extracted Amazon reviews.

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
npm start
```

Or with auto-reload during development:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Endpoints

### Health Check
```
GET /health
```
Returns: `{ status: 'ok' }`

### Generate CSV
```
POST /api/csv
Content-Type: application/json

{
  "reviews": [
    {
      "name": "John Doe",
      "stars": "5.0",
      "title": "Great product",
      "date": "June 1, 2026",
      "description": "Amazing quality and fast shipping",
      "verified": "Yes",
      "helpful": "42"
    }
  ],
  "filename": "product-reviews.csv"
}
```

Returns: CSV file download with BOM (Excel-compatible)

### Validate Reviews
```
POST /api/validate
Content-Type: application/json

{
  "reviews": [...]
}
```

Returns:
```json
{
  "valid": true,
  "stats": {
    "total": 100,
    "withTitle": 95,
    "withDescription": 90,
    "verified": 45,
    "avgRating": "4.5"
  }
}
```

### Batch CSV Generation
```
POST /api/csv/batch
Content-Type: application/json

{
  "batches": [
    {
      "filename": "product1-reviews.csv",
      "reviews": [...]
    },
    {
      "filename": "product2-reviews.csv",
      "reviews": [...]
    }
  ]
}
```

Returns: Array of CSV strings and status

## Environment

Set `PORT` environment variable to change the server port:
```bash
PORT=8080 npm start
```

## Usage from Chrome Extension

The popup will send review data to the backend API and download the CSV:

```javascript
// In popup.js
const backendUrl = 'http://localhost:3000';
const response = await fetch(`${backendUrl}/api/csv`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reviews: extractedReviews,
    filename: `amazon-reviews-${Date.now()}.csv`
  })
});

const blob = await response.blob();
// Trigger download...
```

## Troubleshooting

**CORS errors**: Make sure the backend is running and the URL is correct.

**CSV encoding issues**: The server adds UTF-8 BOM automatically for Excel compatibility.

**Large review sets**: The server supports up to 50MB request size. For larger datasets, use batch endpoint.
