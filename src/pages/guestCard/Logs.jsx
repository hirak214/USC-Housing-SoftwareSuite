import React, { useState, useEffect, useMemo } from 'react';
import { logsApi, cardsApi, requestsApi } from '../../api/guestCardApi';
import { FunnelIcon, DocumentArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    action: 'all', // all, assigned, unassigned, cards-out
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [userModal, setUserModal] = useState({ open: false, user: null, requests: [], loading: false, error: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logsApi.getAll();
      setLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'assigned':
        return 'badge badge-success';
      case 'unassigned':
        return 'badge badge-neutral';
      case 'status_changed':
        return 'badge badge-info';
      default:
        return 'badge badge-neutral';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'assigned':
        return 'Assigned';
      case 'unassigned':
        return 'Returned';
      case 'status_changed':
        return 'Status changed';
      default:
        return action;
    }
  };

  // Get cards that are currently assigned (still out)
  const getCardsStillOut = () => {
    const cardStatus = {};
    
    // Process logs chronologically to track current status
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    sortedLogs.forEach(log => {
      if (log.cardNumber) {
        cardStatus[log.cardNumber] = {
          action: log.action,
          user: log.user,
          timestamp: log.timestamp,
          log: log
        };
      }
    });
    
    // Return logs for cards that are currently assigned
    return Object.values(cardStatus)
      .filter(status => status.action === 'assigned')
      .map(status => status.log);
  };

  // Advanced filtering logic
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by action
    if (filters.action === 'assigned') {
      filtered = filtered.filter(log => log.action === 'assigned');
    } else if (filters.action === 'unassigned') {
      filtered = filtered.filter(log => log.action === 'unassigned');
    } else if (filters.action === 'cards-out') {
      filtered = getCardsStillOut();
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.cardNumber?.toLowerCase().includes(searchTerm) ||
        log.user?.toLowerCase().includes(searchTerm) ||
        log.userIdentifier?.toLowerCase().includes(searchTerm) ||
        log.userEmail?.toLowerCase().includes(searchTerm) ||
        log.userPhone?.toLowerCase().includes(searchTerm) ||
        log.action?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    if (itemsPerPage === 'all') return filteredLogs;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredLogs.map(log => ({
      'Date/Time': formatDate(log.timestamp),
      'Action': log.action,
      'Card Number': log.cardNumber,
      'User/Guest': log.user,
      'Details': log.details || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Card Activity Logs');
    
    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `USC_Card_Logs_${today}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      action: 'all',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Fetch user details by log entry (contains user info)
  const openUserModal = async (logEntry) => {
    setUserModal({ open: true, user: null, requests: [], loading: true, error: '' });
    try {
      const userName = logEntry.user;
      const userEmail = logEntry.userEmail;
      const userPhone = logEntry.userPhone;
      
      // Get all requests (including completed ones) and filter by user details
      const response = await requestsApi.getAll();
      let allRequests = response.data || [];
      
      // Filter requests by name and optionally email/phone for exact match
      const userRequests = allRequests.filter(req => {
        const nameMatches = req.name === userName;
        if (userEmail) {
          return nameMatches && req.email === userEmail;
        }
        if (userPhone) {
          return nameMatches && req.phone === userPhone;
        }
        return nameMatches;
      });
      
      // Get the most recent request with the most complete information
      const primaryUser = userRequests.length > 0 
        ? userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : { 
            name: userName, 
            email: userEmail, 
            phone: userPhone 
          };
      
      // Get user activity from logs - match by user identifier for better accuracy
      const userLogs = logs.filter(log => {
        if (userEmail && log.userEmail) {
          return log.user === userName && log.userEmail === userEmail;
        }
        if (userPhone && log.userPhone) {
          return log.user === userName && log.userPhone === userPhone;
        }
        return log.user === userName;
      });
      
      const cardCount = userLogs.filter(log => log.action === 'assigned').length;
      const returnCount = userLogs.filter(log => log.action === 'unassigned').length;
      
      setUserModal({ 
        open: true, 
        user: { 
          ...primaryUser, 
          cardAssignments: cardCount,
          cardReturns: returnCount,
          totalActivity: userLogs.length,
          uniqueIdentifier: logEntry.userIdentifier || userName
        }, 
        requests: userRequests, 
        loading: false, 
        error: '' 
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      setUserModal({ 
        open: true, 
        user: { 
          name: logEntry.user,
          email: logEntry.userEmail,
          phone: logEntry.userPhone,
          uniqueIdentifier: logEntry.userIdentifier || logEntry.user
        }, 
        requests: [], 
        loading: false, 
        error: 'Failed to fetch user details' 
      });
    }
  };
  const closeUserModal = () => setUserModal({ open: false, user: null, requests: [], loading: false, error: '' });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="display-title text-2xl">Card activity logs</h1>
          <p className="text-sm text-slate-500 mt-1">Review every card assignment and return, and export the record.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary btn-small flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={exportToExcel}
            disabled={filteredLogs.length === 0}
            className="btn-secondary btn-small flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={fetchLogs}
            className="btn-secondary btn-small"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action Filter */}
              <div>
                <label className="form-label">Filter by action</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="form-select w-full"
                >
                  <option value="all">All actions</option>
                  <option value="assigned">Assigned only</option>
                  <option value="unassigned">Returned only</option>
                  <option value="cards-out">Cards still out</option>
                </select>
              </div>

              {/* Search Filter */}
              <div>
                <label className="form-label">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input-field pl-10 w-full"
                    placeholder="Card number, user, action..."
                  />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="form-label">From date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="form-label">To date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="btn-ghost btn-small"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-number">{logs.length}</div>
          <div className="stat-label">Total activities</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {logs.filter(log => log.action === 'assigned').length}
          </div>
          <div className="stat-label">Cards assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {logs.filter(log => log.action === 'unassigned').length}
          </div>
          <div className="stat-label">Cards returned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getCardsStillOut().length}</div>
          <div className="stat-label">Cards still out</div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {/* Results Info and Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-sm text-slate-500">
          Showing {paginatedLogs.length} of {filteredLogs.length} entries
          {filteredLogs.length !== logs.length && ` (filtered from ${logs.length} total)`}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="form-select w-auto text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-12">
          {filters.action === 'all' && !filters.search && !filters.dateFrom && !filters.dateTo
            ? 'No activity has been recorded yet.'
            : 'No activities match your current filters.'}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Date &amp; time</th>
                  <th>Action</th>
                  <th>Card number</th>
                  <th>Guest/User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="table-cell">
                      <span className={getActionBadgeClass(log.action)}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-mono text-slate-900 font-medium">
                        {log.cardNumber}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => openUserModal(log)}
                        className="text-cardinal-700 hover:text-cardinal-800 hover:underline font-medium transition-colors duration-150"
                      >
                        {log.userIdentifier || log.user}
                      </button>
                      {log.userIdentifier && log.userIdentifier !== log.user && (
                        <div className="text-xs text-slate-500 mt-1">
                          {log.userEmail}
                          {log.userEmail && log.userPhone && ' · '}
                          {log.userPhone}
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-slate-500 max-w-xs">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {itemsPerPage !== 'all' && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {userModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="card max-w-lg w-full p-6 rounded-lg relative">
            <button onClick={closeUserModal} className="btn-ghost btn-small absolute top-3 right-3">Close</button>
            <h3 className="display-title text-xl mb-4">User details</h3>
            {userModal.loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading...</div>
            ) : userModal.error ? (
              <div className="alert alert-error">{userModal.error}</div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-lg text-slate-900 mb-2">{userModal.user?.uniqueIdentifier || userModal.user?.name}</div>
                  {userModal.user?.email && (
                    <div className="text-slate-700 text-sm mb-1">{userModal.user.email}</div>
                  )}
                  {userModal.user?.phone && (
                    <div className="text-slate-700 text-sm mb-1">{userModal.user.phone}</div>
                  )}
                  {userModal.user?.createdAt && (
                    <div className="text-slate-500 text-xs">First request: {formatDate(userModal.user.createdAt)}</div>
                  )}
                </div>

                {/* Activity Summary */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="stat-card text-center">
                    <div className="stat-number">{userModal.user?.totalActivity || 0}</div>
                    <div className="stat-label">Total activity</div>
                  </div>
                  <div className="stat-card text-center">
                    <div className="stat-number">{userModal.user?.cardAssignments || 0}</div>
                    <div className="stat-label">Cards assigned</div>
                  </div>
                  <div className="stat-card text-center">
                    <div className="stat-number">{userModal.user?.cardReturns || 0}</div>
                    <div className="stat-label">Cards returned</div>
                  </div>
                </div>

                <div className="mb-2 font-semibold text-slate-800">All requests</div>
                <div className="max-h-32 overflow-y-auto text-sm space-y-2">
                  {userModal.requests.length === 0 ? (
                    <div className="text-slate-400 text-center py-4">No requests found for this user.</div>
                  ) : userModal.requests.map((req) => (
                    <div key={req._id} className="border border-slate-200 rounded-md p-2 bg-slate-50">
                      <div className="flex justify-between items-center">
                        <span className={`badge ${
                          req.status === 'pending' ? 'badge-warning' :
                          req.status === 'completed' ? 'badge-success' :
                          req.status === 'assigned' ? 'badge-info' :
                          'badge-neutral'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-slate-500 text-xs">{formatDate(req.createdAt)}</span>
                      </div>
                      {req.email && <div className="text-slate-600 text-xs mt-1">{req.email}</div>}
                      {req.phone && <div className="text-slate-600 text-xs">{req.phone}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
