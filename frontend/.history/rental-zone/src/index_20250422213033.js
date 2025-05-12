import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Tailwind CSS
import App from './App';
import './assets/vendor/animate.css/animate.min.css';
import './assets/vendor/bootstrap/css/bootstrap.min.css';
import './assets/vendor/bootstrap-icons/bootstrap-icons.css';
import './assets/vendor/swiper/swiper-bundle.min.css';
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
