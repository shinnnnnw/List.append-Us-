// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  inbr_account_id: string;
  name: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 模擬登入功能，成功後帶入 SQL 結構中的會員主檔資料
  const login = () => {
    setUser({
      inbr_account_id: 'c0000000-0000-0000-0000-000000000001', // 對應 mms_order_record 會員UUID
      name: '王小明', // 模擬解密後的姓名
      phone: '0912345001',
      email: 'wang01@example.com'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};