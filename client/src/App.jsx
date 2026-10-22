import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationPollerProvider } from './context/NotificationPollerContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { registerProgressHandlers } from './api/apiClient';
import TopProgressBar from './components/common/TopProgressBar';
import NotificationBanner from './components/common/NotificationBanner';
import AppRoutes from './routes/AppRoutes';

function ProgressBridge() {
  const { start, stop } = useProgress();
  useEffect(() => {
    registerProgressHandlers({ start, stop });
  }, [start, stop]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <ProgressBridge />
        <TopProgressBar />
        <ToastContainer position="top-right" autoClose={3000} />
        <SettingsProvider>
          <LanguageProvider>
            <NotificationProvider>
              <SessionProvider>
                <AuthProvider>
                  <NotificationPollerProvider>
                    <NotificationBanner />
                    <AppRoutes />
                  </NotificationPollerProvider>
                </AuthProvider>
              </SessionProvider>
            </NotificationProvider>
          </LanguageProvider>
        </SettingsProvider>
      </ProgressProvider>
    </BrowserRouter>
  );
}

export default App;
