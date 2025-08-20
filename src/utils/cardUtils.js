/**
 * Utility functions for processing magnetic card swipe data
 */

/**
 * Extract and clean card number from magnetic swipe data
 * @param {string} swipeData - Raw magnetic swipe data
 * @returns {string} - Clean card number
 */
export function extractCardNumber(swipeData) {
  if (!swipeData || typeof swipeData !== 'string') {
    return '';
  }

  // Remove common prefixes and clean the data
  let cleaned = swipeData
    .replace(/^[;]+/, '') // Remove leading semicolons
    .replace(/[=\?+]+.*$/, '') // Remove everything after = or ? or +
    .replace(/[^0-9]/g, '') // Keep only numbers
    .trim();

  // Find the longest numeric sequence (likely the full card number)
  const numbers = cleaned.match(/\d+/g) || [];
  const longestNumber = numbers.reduce((longest, current) => 
    current.length > longest.length ? current : longest, ''
  );

  return longestNumber;
}

/**
 * Validate if a card number looks valid
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidCardNumber(cardNumber) {
  // Basic validation: should be numeric and reasonable length
  return /^\d{6,12}$/.test(cardNumber);
}

/**
 * Format card number for display
 * @param {string} cardNumber - Card number
 * @returns {string} - Formatted card number
 */
export function formatCardNumber(cardNumber) {
  if (!cardNumber) return '';
  
  // Add spaces every 4 digits for readability
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Process multiple swipe attempts and return the best card number
 * @param {string[]} swipeAttempts - Array of swipe data
 * @returns {string} - Best extracted card number
 */
export function processMulitpleSwipes(swipeAttempts) {
  const cardNumbers = swipeAttempts
    .map(extractCardNumber)
    .filter(num => isValidCardNumber(num));

  // Return the most common card number
  const frequency = {};
  cardNumbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });

  return Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b, ''
  );
}
