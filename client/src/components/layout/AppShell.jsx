import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function AppShell({
  children,
  title,
  showBack = false,
  backPath = -1,
  accentColour,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sidebar whenever the URL changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close the mobile sidebar on Escape
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') setSidebarOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={!sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <div className="app-main-header">
          <button
            type="button"
            className="app-main-menu-btn"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <FiMenu />
          </button>

          <Header
            title={title}
            showBack={showBack}
            backPath={backPath}
            accentColour={accentColour}
          />
        </div>

        <main className="app-content">{children}</main>

        <Footer />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AppShell;