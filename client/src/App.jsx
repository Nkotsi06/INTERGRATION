import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <LanguageProvider>
          <NotificationProvider>
            <SessionProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </SessionProvider>
          </NotificationProvider>
        </LanguageProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;