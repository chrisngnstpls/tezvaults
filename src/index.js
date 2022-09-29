import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UseBeaconProvider } from "./hooks/useBeacon";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UseBeaconProvider>
      <App />
    </UseBeaconProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
