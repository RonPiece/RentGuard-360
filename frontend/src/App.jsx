/**
 * File: App.jsx
 * Purpose: The root UI component of the application.
 * Logic: It acts as a thin wrapper that strictly initializes the routing engine (RouterProvider) and imports the global design stylesheets.
 * Note: Kept intentionally minimal to maintain a clean separation between routing configuration and core application state.
 */
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/design-system.css';
import './App.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
