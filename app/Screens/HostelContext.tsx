import React, { createContext, useState, ReactNode } from 'react';

// Loosely typed: this context is shared by the hostel picker and the
// school picker, whose selected-item shapes differ (hostels have
// schoolId/schoolName, schools have location/img), so an index signature
// is more honest than inventing one strict shape that doesn't fit both.
export type SelectedHostel = {
  id?: string;
  name?: string;
  [key: string]: unknown;
} | null;

interface HostelContextValue {
  selectedHostel: SelectedHostel;
  setSelectedHostel: (hostel: SelectedHostel) => void;
}

export const HostelContext = createContext<HostelContextValue>({
  selectedHostel: null,
  setSelectedHostel: () => {},
});

export const HostelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedHostel, setSelectedHostel] = useState<SelectedHostel>(null);

  return (
    <HostelContext.Provider value={{ selectedHostel, setSelectedHostel }}>
      {children}
    </HostelContext.Provider>
  );
};
