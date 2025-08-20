import React, { useState } from 'react';
import { requestsApi } from '../../api/guestCardApi';
import { UserIcon } from '@heroicons/react/24/outline';

const RequestCard = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await requestsApi.create(name.trim());
      setMessage('Request submitted successfully! Please wait for admin to assign a card.');
      setName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <UserIcon className="h-12 w-12 text-troy-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Request a Guest Card</h2>
          <p className="text-gray-600 mt-2">Enter your full name to request a guest card</p>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'btn-secondary' : 'btn-primary'}`}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Your request will be added to the pending queue</li>
            <li>2. An admin will assign you a guest card</li>
            <li>3. You'll receive your card from the front desk</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
