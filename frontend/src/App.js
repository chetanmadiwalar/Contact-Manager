import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('./components/dashboard/AnalyticsDashboard'));
const ContactList = lazy(() => import('./components/contacts/ContactList'));
const ContactForm = lazy(() => import('./components/contacts/ContactForm'));
const GroupManager = lazy(() => import('./components/groups/GroupManager'));
const ActivityLog = lazy(() => import('./components/common/ActivityLog'));
const StarredContacts = lazy(() => import('./components/contacts/StarredContacts'));

function App() {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="main-layout">
          <Sidebar isOpen={sidebarOpen} />
          
          <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <AnimatePresence mode="wait">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contacts" element={<ContactList />} />
                  <Route path="/contacts/new" element={<ContactForm />} />
                  <Route path="/contacts/edit/:id" element={<ContactForm />} />
                  <Route path="/groups" element={<GroupManager />} />
                  <Route path="/activities" element={<ActivityLog />} />
                  <Route path="/starred" element={<StarredContacts />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;