// EmployeeContext.tsx

import React, { createContext, useContext, useState } from 'react';

interface EmployeeContextType {
  employeeId: string | null;
  setEmployeeId: React.Dispatch<React.SetStateAction<string | null>>;
  username: string | null;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
}

const EmployeeContext = createContext<EmployeeContextType>({
  employeeId: null,
  setEmployeeId: () => null,
  username: null,
  setUserName: () => null,
});

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [username, setUserName] = useState<string | null>(null);

  return (
    <EmployeeContext.Provider value={{ employeeId, setEmployeeId,username,setUserName }}>
      {children}
    </EmployeeContext.Provider>
  );
};


export const useEmployeeContext = () => useContext(EmployeeContext);
