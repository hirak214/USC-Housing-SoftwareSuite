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

  // Clean the input - remove any non-numeric characters
  const cleanData = swipeData.replace(/[^0-9]/g, '');
  
  if (!cleanData) {
    return '';
  }

  // For your specific format: 11109741241031110974124103
  // The card number 111097412 appears to be at the beginning
  // Let's try multiple extraction strategies
  
  // Strategy 1: Look for patterns in the data
  // If the data has repeated sequences, the card number might be the unique part
  const dataLength = cleanData.length;
  
  // Strategy 2: Extract based on common card number lengths (6-12 digits)
  // Try different starting positions and lengths
  const possibleCardNumbers = [];
  
  // Check for card numbers of different lengths starting from position 0
  for (let length = 6; length <= 12; length++) {
    if (length <= dataLength) {
      const candidate = cleanData.substring(0, length);
      possibleCardNumbers.push(candidate);
    }
  }
  
  // Strategy 3: Look for the pattern where card number might be repeated
  // In your example: 11109741241031110974124103
  // We can see "1110974" appears twice, suggesting the card number is around there
  for (let i = 0; i < dataLength - 6; i++) {
    for (let length = 6; length <= 12; length++) {
      if (i + length <= dataLength) {
        const candidate = cleanData.substring(i, i + length);
        
        // Check if this candidate appears elsewhere in the string (indicating it might be the card number)
        const firstOccurrence = cleanData.indexOf(candidate);
        const lastOccurrence = cleanData.lastIndexOf(candidate);
        
        if (firstOccurrence !== lastOccurrence && candidate.length >= 6) {
          possibleCardNumbers.push(candidate);
        }
      }
    }
  }
  
  // Strategy 4: For your specific case, try extracting the first 9 digits
  // Based on your example: 111097412 (9 digits)
  if (dataLength >= 9) {
    possibleCardNumbers.push(cleanData.substring(0, 9));
  }
  
  // Strategy 5: Try extracting from different positions
  const commonLengths = [6, 7, 8, 9, 10, 11, 12];
  for (const length of commonLengths) {
    if (dataLength >= length) {
      // From start
      possibleCardNumbers.push(cleanData.substring(0, length));
      
      // From middle (if data is long enough)
      if (dataLength > length * 2) {
        const midStart = Math.floor((dataLength - length) / 2);
        possibleCardNumbers.push(cleanData.substring(midStart, midStart + length));
      }
    }
  }
  
  // Remove duplicates and filter by validity
  const uniqueNumbers = [...new Set(possibleCardNumbers)]
    .filter(num => isValidCardNumber(num))
    .sort((a, b) => {
      // Prefer numbers that appear multiple times in the original data
      const aCount = (cleanData.match(new RegExp(a, 'g')) || []).length;
      const bCount = (cleanData.match(new RegExp(b, 'g')) || []).length;
      
      if (aCount !== bCount) {
        return bCount - aCount; // Higher count first
      }
      
      // If equal count, prefer reasonable lengths (8-10 digits)
      const aScore = Math.abs(a.length - 9); // Distance from 9 digits
      const bScore = Math.abs(b.length - 9);
      return aScore - bScore;
    });
  
  // Return the best candidate
  return uniqueNumbers[0] || cleanData.substring(0, Math.min(9, dataLength));
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
