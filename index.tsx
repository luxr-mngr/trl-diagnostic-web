import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// The admin panel (and Clerk) is a separate chunk: public visitors never download it.
const AdminApp = lazy(() => import('./components/admin/AdminApp'));

const isAdminRoute = /^\/admin(\/|$)/.test(window.location.pathname);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdminRoute ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
