import React, { createContext, useState } from 'react';

export const LocationsContext = createContext<{
  locations: any[];
  setLocations: (locs: any[]) => void;
}>({
  locations: [],
  setLocations: () => {},
});

export const LocationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [locations, setLocations] = useState<any[]>([]);
  return (
    <LocationsContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationsContext.Provider>
  );
}; 