import React, { useState } from 'react';
import { requestsApi } from '../../api/guestCardApi';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PublicRequestCard = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      await requestsApi.create(requestData);
      setSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    setError('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <img
            src="/usc-logo-wordmark.jpg"
            alt="University of Southern California"
            className="h-8 w-auto mx-auto mb-6 mix-blend-multiply"
          />
          <div className="card">
            <div className="card-content text-center">
              <CheckCircleIcon className="h-12 w-12 text-cardinal-600 mx-auto mb-4" />
              <h2 className="display-title text-2xl mb-2">Request submitted</h2>
              <p className="text-sm text-slate-500 mb-6">
                Request submitted. Visit the front desk to collect your card.
              </p>
              <button onClick={handleNewRequest} className="btn-secondary w-full">
                Submit another request
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">USC Housing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <img
          src="/usc-logo-wordmark.jpg"
          alt="University of Southern California"
          className="h-8 w-auto mx-auto mb-6 mix-blend-multiply"
        />
        <div className="text-center mb-6">
          <h1 className="display-title text-2xl">Guest Card Request</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your details and collect your card at the front desk.
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="First name"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="form-label">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="name@usc.edu"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Phone number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="(123) 456-7890"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()}
                className="btn-primary w-full"
              >
                {loading ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">USC Housing</p>
      </div>
    </div>
  );
};

export default PublicRequestCard;
