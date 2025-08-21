/**
 * Utility functions for processing magnetic card swipe data
 */

/**
 * Extract and clean card number from magnetic swipe data
 * @param {string} swipeData - Raw magnetic swipe data
 * @returns {string} - Clean 9-digit card number
 */
export function extractCardNumber(swipeData) {
  if (!swipeData || typeof swipeData !== 'string') {
    return '';
  }

  // Remove all non-numeric characters
  const cleanData = swipeData.replace(/[^0-9]/g, '');
  if (!cleanData) return '';

  // Find all 9-digit sequences
  const matches = cleanData.match(/\d{9}/g);
  if (matches && matches.length > 0) {
    return matches[0]; // Return the first 9-digit sequence
  }
  return '';
}

/**
 * Validate if a card number is exactly 9 digits
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidCardNumber(cardNumber) {
  return /^\d{9}$/.test(cardNumber);
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
