class Review {
  constructor(data) {
    this.name = data.name || 'N/A';
    this.stars = data.stars || 'N/A';
    this.title = data.title || 'N/A';
    this.date = data.date || 'N/A';
    this.description = data.description || 'N/A';
    this.verified = data.verified || 'No';
    this.helpful = data.helpful || '0';
  }

  static sanitize(reviewData) {
    return new Review(reviewData);
  }

  static sanitizeMany(reviewsArray) {
    if (!Array.isArray(reviewsArray)) return [];
    return reviewsArray.map(r => this.sanitize(r));
  }

  static validate(reviewData) {
    // Basic validation check
    if (!reviewData || typeof reviewData !== 'object') {
      return { valid: false, error: 'Review data must be an object' };
    }
    return { valid: true };
  }

  static validateMany(reviewsArray) {
    if (!Array.isArray(reviewsArray)) {
      return { valid: false, error: 'Reviews must be an array' };
    }
    return { valid: true };
  }
}

module.exports = Review;
