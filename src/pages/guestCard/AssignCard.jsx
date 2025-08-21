import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsApi, cardsApi } from '../../api/guestCardApi';
import { extractCardNumber, isValidCardNumber, formatCardNumber } from '../../utils/cardUtils';
import { CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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
      await cardsApi.assign(cardNumber.trim(), request.name, request._id);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-troy-red"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/guest-card-inventory/pending')}
            className="btn-secondary mr-4 p-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-8 w-8 text-troy-red" />
            <h2 className="text-2xl font-bold text-gray-900">Assign Card</h2>
          </div>
        </div>

        {request && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Request Details</h3>
            <p className="text-blue-800"><strong>Name:</strong> {request.name}</p>
            <p className="text-blue-800"><strong>Status:</strong> {request.status}</p>
            <p className="text-blue-800">
              <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        )}

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

        {request && request.status === 'pending' && (
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
              className={`w-full ${loading ? 'btn-secondary' : 'btn-success'}`}
            >
              {loading ? 'Assigning...' : 'Assign Card'}
            </button>
          </form>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Swipe the guest card through the magnetic reader</li>
            <li>• Or manually enter the card number if reader is unavailable</li>
            <li>• The system will check if the card is already assigned</li>
            <li>• Card will be linked to the guest's name upon assignment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignCard;
