import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId?: string;
  username: string;
  email: string;
  password?: string;
  avatar?: number;
  played?: number;
  wins?: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Load user from storage on init
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        // Ensure defaults
        parsed.played = parsed.played || 0;
        parsed.wins = parsed.wins || 0;
        setUserState(parsed);
      }
    };
    loadUser();
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUserState(updated);
    await AsyncStorage.setItem('currentUser', JSON.stringify(updated));

    // Also sync to users array
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.userId === updated.userId);
    if (index !== -1) {
      users[index] = updated;
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
