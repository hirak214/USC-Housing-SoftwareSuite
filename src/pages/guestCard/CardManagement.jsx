import React, { useState, useEffect } from 'react';
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

  const getActionBadge = (action) => {
    switch (action) {
      case 'assigned': return { variant: 'badge-success', label: 'Assigned' };
      case 'unassigned': return { variant: 'badge-neutral', label: 'Returned' };
      case 'status_changed': return { variant: 'badge-info', label: 'Status changed' };
      default: return { variant: 'badge-neutral', label: action };
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="display-title text-2xl">Card management</h1>
        <p className="text-sm text-slate-500 mt-1">Look up a card to view its status and activity.</p>
      </div>

      <div className="card">
        <div className="card-content">
          {/* Card lookup */}
          <div>
            <label htmlFor="cardNumber" className="form-label">Card number</label>
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
            <p className="form-help">Swipe the card or type its number.</p>
            {cardNumber && isValidCardNumber(cardNumber) && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">
                  Detected card: {formatCardNumber(cardNumber)}
                </p>
                <button
                  onClick={() => fetchCardData(cardNumber)}
                  disabled={loading}
                  className="btn-primary btn-small"
                >
                  {loading ? 'Loading…' : 'View card details'}
                </button>
              </div>
            )}
          </div>

          {error && <div className="alert alert-error mt-4">{error}</div>}
          {message && <div className="alert alert-success mt-4">{message}</div>}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="loading-spinner"></div>
            </div>
          )}

          {/* Card information */}
          {cardData && !loading && (
            <div className="space-y-6 mt-6">
              {/* Status tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="stat-number font-mono">{formatCardNumber(cardData.cardNumber)}</div>
                  <div className="stat-label">Card number</div>
                </div>
                <div className="stat-card">
                  <span className={`badge ${cardData.isAssigned ? 'badge-info' : 'badge-neutral'}`}>
                    {cardData.isAssigned ? 'Assigned' : 'Available'}
                  </span>
                  <div className="stat-label mt-2">Assignment</div>
                </div>
                <div className="stat-card">
                  <span className={`badge ${cardData.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {cardData.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="stat-label mt-2">Card status</div>
                </div>
              </div>

              {cardData.isAssigned && (
                <div className="alert alert-info">
                  <div className="font-medium">Assigned to {cardData.assignedTo}</div>
                  <div className="mt-0.5">Since {new Date(cardData.assignedAt).toLocaleString()}</div>
                </div>
              )}

              {/* Activate / deactivate */}
              <div className="card">
                <div className="card-content flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {cardData.isActive ? 'Deactivate card' : 'Activate card'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {cardData.isActive
                        ? 'Inactive cards cannot be assigned to new users.'
                        : 'Active cards can be assigned to users.'}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    disabled={loading}
                    className={cardData.isActive ? 'btn-danger btn-small' : 'btn-primary btn-small'}
                  >
                    {loading ? 'Updating…' : (cardData.isActive ? 'Deactivate' : 'Activate')}
                  </button>
                </div>
              </div>

              {/* Card history */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity</h3>
                {cardHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No activity recorded for this card.
                  </div>
                ) : (
                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead className="table-header">
                          <tr>
                            <th>Action</th>
                            <th>Details</th>
                            <th>When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cardHistory.map((log, index) => {
                            const badge = getActionBadge(log.action);
                            return (
                              <tr key={index} className="table-row">
                                <td className="table-cell">
                                  <span className={`badge ${badge.variant}`}>{badge.label}</span>
                                </td>
                                <td className="table-cell">
                                  <div className="font-medium text-slate-900">
                                    {log.action === 'status_changed' ? 'System' : (log.userIdentifier || log.user)}
                                  </div>
                                  {log.action === 'status_changed' && log.details && (
                                    <div className="text-slate-500">{log.details}</div>
                                  )}
                                  {log.userIdentifier && log.userIdentifier !== log.user && log.action !== 'status_changed' && (
                                    <div className="text-slate-500">
                                      {log.userEmail}
                                      {log.userEmail && log.userPhone && ' · '}
                                      {log.userPhone}
                                    </div>
                                  )}
                                </td>
                                <td className="table-cell text-slate-500">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
