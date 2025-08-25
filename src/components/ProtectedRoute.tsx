import React from 'react';
import { useAtomValue } from 'jotai';
import { Navigate } from 'react-router-dom';
import { userAtom } from '../store/auth';

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = useAtomValue(userAtom);

  // ユーザーがログインしていない場合、ログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ログインしている場合は、子コンポーネント（HomePageなど）をそのまま表示
  return <>{children}</>;
};