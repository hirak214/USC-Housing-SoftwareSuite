import React, { useState, useEffect } from 'react';
import { CreditCardIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cardsApi, logsApi } from '../../api/guestCardApi';
import { extractCardNumber, isValidCardNumber, formatCardNumber } from '../../utils/cardUtils';

const CardManagement = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardData, setCardData] = useState(null);
  const [cardHistory, setCardHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value;
    
    // Check if this looks like magnetic stripe data
    const isLikelySwipeData = 
      rawValue.includes(';') || 
      rawValue.includes('=') || 
      rawValue.includes('?') ||
      (rawValue.replace(/[^0-9]/g, '').length > 12);
    
    if (isLikelySwipeData) {
      const extracted = extractCardNumber(rawValue);
      setCardNumber(extracted);
      if (extracted && isValidCardNumber(extracted)) {
        fetchCardData(extracted);
      }
    } else {
      const cleaned = rawValue.replace(/[^0-9]/g, '');
      setCardNumber(cleaned);
    }
  };

  const fetchCardData = async (cardNum) => {
    if (!cardNum || !isValidCardNumber(cardNum)) {
      setError('Please enter a valid 9-digit card number');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Get card status
      const cardResponse = await cardsApi.getStatus(cardNum);
      const card = cardResponse.data;

      // Get card history from logs
      const logsResponse = await logsApi.getAll();
      const allLogs = logsResponse.data || [];
      const history = allLogs
        .filter(log => log.cardNumber === cardNum)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setCardData({
        ...card,
        cardNumber: cardNum,
        exists: card.exists !== false
      });
      setCardHistory(history);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch card data');
      setCardData(null);
      setCardHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!cardData) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await cardsApi.toggleActive(cardData.cardNumber, !cardData.isActive);
      setMessage(`Card ${cardData.isActive ? 'deactivated' : 'activated'} successfully`);
      
      // Refresh card data
      await fetchCardData(cardData.cardNumber);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update card status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'text-green-600 bg-green-100';
      case 'unassigned': return 'text-blue-600 bg-blue-100';
      case 'status_changed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return <CheckCircleIcon className="h-4 w-4" />;
      case 'unassigned': return <XCircleIcon className="h-4 w-4" />;
      case 'status_changed': return <Cog6ToothIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-8 w-8 text-troy-red" />
            <h2 className="text-2xl font-bold text-gray-900">Card Management</h2>
          </div>
        </div>

        {/* Card Input Section */}
        <div className="mb-8">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number *
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={handleCardNumberChange}
            className="input-field font-mono text-lg"
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

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="alert-success mb-6">
            {message}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-troy-red"></div>
          </div>
        )}

        {/* Card Information */}
        {cardData && !loading && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{formatCardNumber(cardData.cardNumber)}</div>
                  <div className="text-sm text-gray-500">Card Number</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className={`text-lg font-semibold ${cardData.isAssigned ? 'text-green-600' : 'text-gray-600'}`}>
                    {cardData.isAssigned ? 'ASSIGNED' : 'AVAILABLE'}
                  </div>
                  <div className="text-sm text-gray-500">Assignment Status</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className={`text-lg font-semibold ${cardData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {cardData.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  <div className="text-sm text-gray-500">Card Status</div>
                </div>
              </div>
              
              {cardData.isAssigned && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-blue-900">Assigned to: {cardData.assignedTo}</div>
                      <div className="text-sm text-blue-700">
                        Since: {new Date(cardData.assignedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Management Actions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Management</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {cardData.isActive ? 'Deactivate Card' : 'Activate Card'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cardData.isActive 
                      ? 'Inactive cards cannot be assigned to new users' 
                      : 'Active cards can be assigned to users'
                    }
                  </div>
                </div>
                <button
                  onClick={handleToggleActive}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md font-medium ${
                    cardData.isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Updating...' : (cardData.isActive ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </div>

            {/* Card History */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Card History</h3>
                <p className="text-sm text-gray-500">Complete activity log for this card</p>
              </div>
              
              {cardHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity recorded for this card</p>
                </div>
              ) : (
                <div className="divide-y">
                  {cardHistory.map((log, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${getStatusColor(log.action)}`}>
                            {getStatusIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.action)}`}>
                                {log.action === 'assigned' ? 'Assigned' : 
                                 log.action === 'unassigned' ? 'Returned' : 
                                 log.action === 'status_changed' ? 'Status Changed' : 
                                 log.action}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="font-medium text-gray-900">
                                {log.action === 'status_changed' ? 'System' : (log.userIdentifier || log.user)}
                              </div>
                              {log.action === 'status_changed' && log.details && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {log.details}
                                </div>
                              )}
                              {log.userIdentifier && log.userIdentifier !== log.user && log.action !== 'status_changed' && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {log.userEmail && `📧 ${log.userEmail}`}
                                  {log.userPhone && ` 📞 ${log.userPhone}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-gray-600">
                            {formatCardNumber(log.cardNumber)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Swipe any guest card to view its complete information and history</li>
            <li>• See current assignment status and card activity status</li>
            <li>• View complete history of all assignments and returns</li>
            <li>• Toggle card active/inactive status as needed</li>
            <li>• Inactive cards cannot be assigned but can still be returned</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
