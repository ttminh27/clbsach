import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Tự động tải lại trang khi Cloudflare Pages triển khai phiên bản build mới (tránh lỗi stale chunks)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

// Hủy mọi Service Worker rác nếu người dùng từng có trên domain này
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

