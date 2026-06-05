import React, { createContext, useContext, useState } from "react";
import type { UserRole } from "@/types";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  avatar?: string;
  kycStatus: "pending" | "in_review" | "approved" | "rejected";
}

interface AppContextType {
  user: AppUser;
  setRole: (role: UserRole) => void;
  notifications: number;
}

const defaultBuyer: AppUser = {
  id: "b1",
  name: "Arjun Malhotra",
  email: "arjun@hplpaints.com",
  role: "buyer",
  companyName: "Hindustan Paints Ltd",
  kycStatus: "approved",
};

const defaultSupplier: AppUser = {
  id: "s1",
  name: "Rajesh Sharma",
  email: "rajesh@adityachem.com",
  role: "supplier",
  companyName: "Aditya Chemicals Pvt Ltd",
  kycStatus: "approved",
};

const AppContext = createContext<AppContextType>({
  user: defaultBuyer,
  setRole: () => {},
  notifications: 5,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(defaultBuyer);

  function setRole(role: UserRole) {
    setUser(role === "buyer" ? defaultBuyer : defaultSupplier);
  }

  return (
    <AppContext.Provider value={{ user, setRole, notifications: 5 }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
