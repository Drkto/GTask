import React, { createContext, useState } from "react";

export const ApiUrlContext = createContext();

export const ApiUrlProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState("http://178.253.42.83:3000");
  //Выбор сервера
  const toggleApiUrl = () => {
    setApiUrl((prevUrl) =>
      prevUrl === "http://178.253.42.83:3000"
        ? "http://178.253.42.83:3000"
        : "http://192.168.0.32:3000"
    );
  };

  return (
    <ApiUrlContext.Provider value={{ apiUrl, toggleApiUrl }}>
      {children}
    </ApiUrlContext.Provider>
  );
};
