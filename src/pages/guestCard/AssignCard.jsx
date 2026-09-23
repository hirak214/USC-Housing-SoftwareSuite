import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsApi, cardsApi } from '../../api/guestCardApi';
import { extractCardNumber, isValidCardNumber, formatCardNumber } from '../../utils/cardUtils';

const AssignCard = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRequest, setFetchingRequest] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setFetchingRequest(true);
      const response = await requestsApi.getById(requestId);
      setRequest(response.data);

      if (response.data.status === 'completed') {
        setError('This request has already been completed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch request details');
    } finally {
      setFetchingRequest(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cardNumber.trim()) {
      setError('Please enter or swipe a card number');
      return;
    }

    if (!request) {
      setError('Request details not found');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await cardsApi.assign(
        cardNumber.trim(),
        request.name,
        request._id,
        request.email,
        request.phone
      );
      setMessage(`Card ${cardNumber} successfully assigned to ${request.name}`);
      // Redirect to pending requests after 2 seconds
      setTimeout(() => {
        navigate('/guest-card-inventory/pending');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign card');
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

  if (fetchingRequest) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/guest-card-inventory/pending')}
          className="btn-ghost mb-3 -ml-2"
        >
          Back to pending
        </button>
        <h1 className="display-title text-2xl">Assign a guest card</h1>
        <p className="text-sm text-slate-500 mt-1">Swipe the card or type the number to assign it to this guest.</p>
      </div>

      <div className="card">
        <div className="card-content">
          {request && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
              <dl className="text-sm space-y-1">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="text-slate-900 text-right">{request.name}</dd>
                </div>
                {request.email && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="text-slate-900 text-right">{request.email}</dd>
                  </div>
                )}
                {request.phone && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="text-slate-900 text-right">{request.phone}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-slate-900 text-right">{request.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Requested</dt>
                  <dd className="text-slate-900 text-right">{new Date(request.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}

          {error && <div className="alert alert-error mb-4">{error}</div>}
          {message && <div className="alert alert-success mb-4">{message}</div>}

          {request && request.status === 'pending' && (
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

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Assigning…' : 'Assign card'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignCard;
