import React, { createContext, useContext, useState } from 'react';

const UserEmailContext = createContext(null);

export const useUserEmail = () => useContext(UserEmailContext);

export const UserEmailProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <UserEmailContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </UserEmailContext.Provider>
  );
};
