import React from 'react';
import { useAtomValue } from 'jotai';
import { Navigate } from 'react-router-dom';
import { userAtom } from '../store/auth';

export const PublicRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = useAtomValue(userAtom);

  // ユーザーがログインしている場合、ホームページにリダイレクト
  if (user) {
    return <Navigate to="/" replace />;
  }

  // ログインしていない場合は、子コンポーネント（LoginPageなど）をそのまま表示
  return <>{children}</>;
};