const { stringify } = require('csv-stringify/sync');
const Review = require('../models/Review');

const generateCsv = (req, res) => {
  try {
    const { reviews, filename } = req.body;

    const validation = Review.validateMany(reviews);
    if (!validation.valid || reviews.length === 0) {
      return res.status(400).json({ error: validation.error || 'No reviews provided' });
    }

    const sanitized = Review.sanitizeMany(reviews);
    const columns = ['name', 'stars', 'title', 'date', 'description', 'verified', 'helpful'];

    // Generate CSV
    const csv = stringify(sanitized, {
      header: true,
      columns: columns,
      cast: {
        string: (value) => {
          // Escape quotes and wrap in quotes if needed
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        },
      },
    });

    // Add BOM for Excel compatibility
    const csvWithBom = '\ufeff' + csv;

    // Set response headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'amazon-reviews.csv'}"`);

    res.send(csvWithBom);
  } catch (error) {
    console.error('CSV generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate CSV' });
  }
};

const generateBatchCsv = (req, res) => {
  try {
    const { batches } = req.body; // [{filename, reviews}, ...]

    if (!Array.isArray(batches) || batches.length === 0) {
      return res.status(400).json({ error: 'No batches provided' });
    }

    const results = batches.map((batch) => {
      try {
        const columns = ['name', 'stars', 'title', 'date', 'description', 'verified', 'helpful'];
        const sanitized = Review.sanitizeMany(batch.reviews);

        const csv = stringify(sanitized, {
          header: true,
          columns: columns,
        });

        return {
          filename: batch.filename,
          success: true,
          csv: '\ufeff' + csv,
        };
      } catch (err) {
        return {
          filename: batch.filename,
          success: false,
          error: err.message,
        };
      }
    });

    res.json(results);
  } catch (error) {
    console.error('Batch CSV error:', error);
    res.status(500).json({ error: error.message });
  }
};

const validateReviews = (req, res) => {
  try {
    const { reviews } = req.body;

    const validation = Review.validateMany(reviews);
    if (!validation.valid) {
      return res.status(400).json({ valid: false, error: validation.error });
    }

    const stats = {
      total: reviews.length,
      withTitle: reviews.filter((r) => r.title && r.title !== 'N/A').length,
      withDescription: reviews.filter((r) => r.description && r.description !== 'N/A').length,
      verified: reviews.filter((r) => r.verified === 'Yes').length,
      avgRating: (
        reviews.reduce((sum, r) => {
          const stars = parseFloat(r.stars);
          return sum + (isNaN(stars) ? 0 : stars);
        }, 0) / reviews.length
      ).toFixed(2),
    };

    res.json({ valid: true, stats });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
};

module.exports = {
  generateCsv,
  generateBatchCsv,
  validateReviews,
};
