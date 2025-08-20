cimport React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequestCard from './pages/RequestCard';
import PendingRequests from './pages/PendingRequests';
import AssignCard from './pages/AssignCard';
import ReturnCard from './pages/ReturnCard';
import Logs from './pages/Logs';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/guest-card-inventory" replace />} />
          <Route path="/guest-card-inventory" element={<RequestCard />} />
          <Route path="/guest-card-inventory/pending" element={<PendingRequests />} />
          <Route path="/guest-card-inventory/assign/:requestId" element={<AssignCard />} />
          <Route path="/guest-card-inventory/return" element={<ReturnCard />} />
          <Route path="/guest-card-inventory/logs" element={<Logs />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;