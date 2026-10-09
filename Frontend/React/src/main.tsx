/**
 * Main Entry Point
 * Initializes the React application with StrictMode for development checks
 * 
 * @module main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Get the root DOM element
const rootElement = document.getElementById('root');

// Ensure root element exists before mounting
if (!rootElement) {
  throw new Error(
    'Root element not found. Please check your index.html file.'
  );
}

// Create React root and render the application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);