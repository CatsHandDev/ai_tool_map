import React from 'react';
import { useSetAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { userAtom, authReadyAtom } from '../store/auth';

export const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const setAuthReady = useSetAtom(authReadyAtom);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

   React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser, setAuthReady]);

  if (!isAuthReady) {
    return <div className="full-page-loader">認証情報を確認中...</div>;
  }

  return <>{children}</>;
};