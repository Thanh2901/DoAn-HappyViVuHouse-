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
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n/i18n';
import { Provider } from 'react-redux';
import store from './redux/store';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </Provider>
    </React.StrictMode>
);
