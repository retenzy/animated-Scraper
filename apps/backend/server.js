const express = require('express');
const cors = require('cors');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Amazon Reviews Backend running' });
});

// API Routes
app.use('/api', reviewRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Amazon Reviews Backend running on http://localhost:${PORT}`);
  console.log(`CSV endpoints: POST http://localhost:${PORT}/api/csv`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
});
