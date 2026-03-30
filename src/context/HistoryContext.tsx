import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HistoryItem {
  id: string;
  tool: string;
  timestamp: string;
  input?: string;
  output?: any;
}

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_history', JSON.stringify(history));
  }, [history]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory, deleteHistoryItem }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within HistoryProvider');
  return context;
};
