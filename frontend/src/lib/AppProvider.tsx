import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Loader from "../components/elements/Loader";
import type { User } from "./Types";
import { getAuthUserJwt } from "../api/user";

interface AppContextType {
  user: User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { data: user, isPending } = useQuery({
    queryKey: ["jwt-user"],
    queryFn: () => getAuthUserJwt(),
    retry: false,
  });
  console.log(user);
  console.log(isPending);

  return isPending ? (
    <Loader />
  ) : (
    <AppContext.Provider
      value={{
        user,
      }}
    >
      {children}
      <ToastContainer />
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
