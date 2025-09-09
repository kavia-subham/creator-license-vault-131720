import React from 'react';
import './App.css';
import AppRouter from './routes/AppRouter';
import { AppProvider } from './state/AppContext';

// PUBLIC_INTERFACE
function App() {
  /** Root application component.
   * Provides global state via AppProvider and mounts the AppRouter.
   * Theming is handled by AppProvider setting data-theme on the html element.
   */
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
