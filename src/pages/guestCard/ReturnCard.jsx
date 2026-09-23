import React, { useState } from 'react';
import { cardsApi } from '../../api/guestCardApi';
import { extractCardNumber, isValidCardNumber, formatCardNumber } from '../../utils/cardUtils';

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
      <div className="mb-6">
        <h1 className="display-title text-2xl">Return a guest card</h1>
        <p className="text-sm text-slate-500 mt-1">Return a card so it becomes available for assignment.</p>
      </div>

      <div className="card">
        <div className="card-content">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          {message && <div className="alert alert-success mb-4">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="form-label">Card number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="input-field font-mono w-full"
                placeholder="Swipe card or enter card number"
                required
                disabled={loading}
                autoFocus
              />
              <p className="form-help">Swipe the card or type the number.</p>
              {cardNumber && isValidCardNumber(cardNumber) && (
                <p className="text-xs text-emerald-600 mt-1">
                  Detected card: {formatCardNumber(cardNumber)}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-danger w-full">
              {loading ? 'Processing…' : 'Return card'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnCard;
