import React, { useState, useEffect, useMemo } from 'react';
import { logsApi, cardsApi, requestsApi } from '../../api/guestCardApi';
import { DocumentTextIcon, CreditCardIcon, FunnelIcon, DocumentArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

  const getActionColor = (action) => {
    switch (action) {
      case 'assigned':
        return 'bg-green-100 text-green-800';
      case 'unassigned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    const filename = `Troy_CSC_Card_Logs_${today}.xlsx`;
    
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

  // Fetch user details by name (and optionally email/phone)
  const openUserModal = async (userName) => {
    setUserModal({ open: true, user: null, requests: [], loading: true, error: '' });
    try {
      // Try to find requests for this user (by name)
      const allRequests = await requestsApi.getByName ? await requestsApi.getByName(userName) : await requestsApi.getAll();
      let requests = [];
      if (Array.isArray(allRequests.data)) {
        requests = allRequests.data.filter(r => r.name === userName);
      } else if (allRequests.data && allRequests.data.name === userName) {
        requests = [allRequests.data];
      }
      setUserModal({ open: true, user: requests[0] || { name: userName }, requests, loading: false, error: '' });
    } catch (err) {
      setUserModal({ open: true, user: { name: userName }, requests: [], loading: false, error: 'Failed to fetch user details' });
    }
  };
  const closeUserModal = () => setUserModal({ open: false, user: null, requests: [], loading: false, error: '' });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-troy-red"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-troy-red" />
            <h2 className="text-2xl font-bold text-gray-900">Card Activity Logs</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline text-sm flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={exportToExcel}
              disabled={filteredLogs.length === 0}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            
            <button
              onClick={fetchLogs}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">All Actions</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Returned Only</option>
                  <option value="cards-out">Cards Still Out</option>
                </select>
              </div>

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
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
                className="btn-outline text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Total Activities</h3>
            <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Cards Assigned</h3>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.action === 'assigned').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">Cards Returned</h3>
            <p className="text-2xl font-bold text-red-600">
              {logs.filter(log => log.action === 'unassigned').length}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Cards Still Out</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {getCardsStillOut().length}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        {/* Results Info and Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing {paginatedLogs.length} of {filteredLogs.length} entries
            {filteredLogs.length !== logs.length && ` (filtered from ${logs.length} total)`}
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input-field w-auto text-sm"
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
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">
              {filters.action === 'all' && !filters.search && !filters.dateFrom && !filters.dateTo
                ? 'No activity has been recorded yet.'
                : 'No activities match your current filters.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest/User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action === 'assigned' ? 'Assigned' : log.action === 'unassigned' ? 'Returned' : log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-mono text-gray-900 font-medium">
                          {log.cardNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-troy-red font-semibold cursor-pointer underline hover:text-troy-gold" onClick={() => openUserModal(log.user)}>
                      {log.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-troy-red text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {userModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
            <button onClick={closeUserModal} className="absolute top-2 right-2 text-gray-400 hover:text-troy-red text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold mb-2 text-troy-red">User Details</h3>
            {userModal.loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : userModal.error ? (
              <div className="alert-error">{userModal.error}</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="font-semibold text-lg text-gray-900">{userModal.user?.name}</div>
                  {userModal.user?.email && <div className="text-gray-700 text-sm">Email: {userModal.user.email}</div>}
                  {userModal.user?.phone && <div className="text-gray-700 text-sm">Phone: {userModal.user.phone}</div>}
                  {userModal.user?.firstName && userModal.user?.lastName && (
                    <div className="text-gray-700 text-sm">Full Name: {userModal.user.firstName} {userModal.user.lastName}</div>
                  )}
                  {userModal.user?.createdAt && <div className="text-gray-500 text-xs">Requested: {formatDate(userModal.user.createdAt)}</div>}
                </div>
                <div className="mb-2 font-semibold text-gray-800">All Requests by this User:</div>
                <ul className="max-h-40 overflow-y-auto text-sm space-y-1">
                  {userModal.requests.length === 0 ? (
                    <li className="text-gray-400 italic">No requests found.</li>
                  ) : userModal.requests.map((req) => (
                    <li key={req._id} className="border-b last:border-b-0 py-1">
                      <span className="font-medium">{req.status}</span> &mdash; <span className="text-gray-700">{formatDate(req.createdAt)}</span>
                      {req.email && <span className="ml-2 text-gray-500">({req.email})</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
