import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
// import { Amplify } from 'aws-amplify'; // Not needed for demo mode
import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import NewCase from './pages/NewCase';
import CaseDetail from './pages/CaseDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import ClientPortal from './pages/ClientPortal';
import Billing from './pages/Billing';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import DeadlineCalculator from './pages/DeadlineCalculator';
import Attorneys from './pages/Attorneys';
import Firms from './pages/Firms';
import System from './pages/System';
import Permissions from './pages/Permissions';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Utils
import { loadConfig } from './utils/config';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const config = await loadConfig();
        
        // Skip Amplify configuration for demo mode
        // Amplify is not needed for the mock backend
        
        setConfigLoaded(true);
      } catch (error) {
        console.error('Failed to load configuration:', error);
        // Continue anyway for demo mode
        setConfigLoaded(true);
      }
    };

    initializeApp();
  }, []);

  if (!configLoaded) {
    return <div>Loading configuration...</div>;
  }

  return (
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <ErrorBoundary>
              <LoadingProvider>
                <NotificationProvider>
                  <AuthProvider>
                    <Router>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                          <Route index element={<Navigate to="/dashboard" replace />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="cases" element={<Cases />} />
                          <Route path="cases/new" element={<NewCase />} />
                          <Route path="cases/:caseId" element={<CaseDetail />} />
                          <Route path="clients" element={<Clients />} />
                          <Route path="clients/:clientId" element={<ClientDetail />} />
                          <Route path="attorneys" element={<Attorneys />} />
                          <Route path="documents" element={<Documents />} />
                          <Route path="tasks" element={<Tasks />} />
                          <Route path="calendar" element={<Calendar />} />
                          <Route path="client-portal" element={<ClientPortal />} />
                          <Route path="billing" element={<Billing />} />
                          <Route path="users" element={<Users />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="ai-assistant" element={<AIAssistant />} />
                          <Route path="deadline-calculator" element={<DeadlineCalculator />} />
                          <Route path="firms" element={<Firms />} />
                          <Route path="system" element={<System />} />
                          <Route path="permissions" element={<Permissions />} />
                        </Route>
                      </Routes>
                    </Router>
                  </AuthProvider>
                </NotificationProvider>
              </LoadingProvider>
            </ErrorBoundary>
          </LocalizationProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App;