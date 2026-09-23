import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsApi } from '../../api/guestCardApi';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getPending();
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      setLoading(true);
      await requestsApi.delete(id);
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="display-title text-2xl">Pending requests</h1>
          <p className="text-sm text-slate-500 mt-1">Assign a card to each guest or remove the request.</p>
        </div>
        <button onClick={fetchPendingRequests} className="btn-secondary btn-small">
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {requests.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No pending requests.
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="table-row">
                    <td className="table-cell font-medium text-slate-900">
                      {request.name}
                    </td>
                    <td className="table-cell">
                      {request.email && <div className="text-slate-700">{request.email}</div>}
                      {request.phone && <div className="text-slate-500">{request.phone}</div>}
                      {!request.email && !request.phone && (
                        <span className="text-slate-400">No contact info</span>
                      )}
                    </td>
                    <td className="table-cell text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-warning">{request.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/guest-card-inventory/assign/${request._id}`}
                          className="btn-primary btn-small"
                        >
                          Assign
                        </Link>
                        <button
                          onClick={() => handleDelete(request._id)}
                          className="btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
