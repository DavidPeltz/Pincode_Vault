import React, { createContext, useContext } from 'react';

// Create context for grid refresh functionality
const GridRefreshContext = createContext();

export const useGridRefresh = () => {
  const context = useContext(GridRefreshContext);
  if (!context) {
    throw new Error('useGridRefresh must be used within a GridRefreshProvider');
  }
  return context;
};

export default GridRefreshContext;
