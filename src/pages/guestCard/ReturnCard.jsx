import React, { useState } from 'react';
import { cardsApi } from '../../api/guestCardApi';
import { extractCardNumber, isValidCardNumber, formatCardNumber } from '../../utils/cardUtils';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

const ReturnCard = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardNumber.trim()) {
      setError('Please enter or swipe a card number');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await cardsApi.unassign(cardNumber.trim());
      setMessage(`Card ${cardNumber} has been successfully returned and is now available for assignment.`);
      setCardNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to return card');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value;
    
    // Check if this looks like magnetic stripe data
    // Your format: 11109741241031110974124103 (all numbers, longer than typical card number)
    const isLikelySwipeData = 
      rawValue.includes(';') || 
      rawValue.includes('=') || 
      rawValue.includes('?') ||
      (rawValue.replace(/[^0-9]/g, '').length > 12); // Longer than typical card numbers
    
    if (isLikelySwipeData) {
      // Use the improved extraction for magnetic stripe data
      const extracted = extractCardNumber(rawValue);
      setCardNumber(extracted);
    } else {
      // Manual entry - just keep numbers
      const cleaned = rawValue.replace(/[^0-9]/g, '');
      setCardNumber(cleaned);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <ArrowUturnLeftIcon className="h-12 w-12 text-troy-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Return Guest Card</h2>
          <p className="text-gray-600 mt-2">Process card returns and make them available for reassignment</p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Card Number *
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="input-field font-mono"
              placeholder="Swipe card or enter card number"
              required
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Swipe the magnetic strip or manually type the card number. Swipe data will be automatically cleaned.
            </p>
            {cardNumber && isValidCardNumber(cardNumber) && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Detected card: {formatCardNumber(cardNumber)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'btn-secondary' : 'btn-danger'}`}
          >
            {loading ? 'Processing...' : 'Return Card'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Return Process</h3>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Swipe or enter the card number to be returned</li>
            <li>2. System verifies the card is currently assigned</li>
            <li>3. Card status is updated to "available"</li>
            <li>4. Return action is logged with timestamp</li>
            <li>5. Card becomes available for future assignments</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <h3 className="font-medium text-red-900 mb-2">Important Notes</h3>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Only assigned cards can be returned</li>
            <li>• Returning a card immediately makes it available</li>
            <li>• All returns are logged for audit purposes</li>
            <li>• Double-check card number before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReturnCard;
