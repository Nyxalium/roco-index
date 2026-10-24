import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App';
import './styles.css';
import './companion.css';
import './localization.css';
import './field-guide.css';
import './music.css';
import './bundles.css';
import './resources.css';
import './footer.css';
import './game-ui.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 280, damping: 30 }}>
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
