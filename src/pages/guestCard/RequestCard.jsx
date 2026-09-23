import React, { useState } from 'react';
import { requestsApi } from '../../api/guestCardApi';

const RequestCard = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    setMessage('');

    try {
      const requestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };
      
      await requestsApi.create(requestData);
      setMessage('Request submitted successfully! Please wait for admin to assign a card.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="display-title text-2xl">Request a guest card</h1>
        <p className="text-sm text-slate-500 mt-1">Enter the guest's details to add them to the pending queue.</p>
      </div>

      <div className="card">
        <div className="card-content">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          {message && <div className="alert alert-success mb-4">{message}</div>}

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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
