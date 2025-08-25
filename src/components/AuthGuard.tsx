import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { userAtom, authReadyAtom } from '../store/auth';

// React.PropsWithChildren を使って、子コンポーネントを受け取れるようにする
export const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const authReady = useAtomValue(authReadyAtom);
  const setUser = useSetAtom(userAtom);
  const setAuthReady = useSetAtom(authReadyAtom);

  // ★ このコンポーネントがマウントされた時に一度だけ実行する
  React.useEffect(() => {
    console.log("AuthGuard: Starting auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthGuard: onAuthStateChanged fired. User:", user?.uid || null);
      setUser(user);
      setAuthReady(true);
    });

    return () => {
      console.log("AuthGuard: Cleaning up auth listener.");
      unsubscribe();
    };
  }, [setUser, setAuthReady]); // ★ Jotaiのsetterは安定しているので、実質一度しか実行されない

  // 認証確認が終わるまでは、ローディング画面を表示
  if (!authReady) {
    return <div className="full-page-loader">認証情報を確認中...</div>;
  }

  // 認証確認が終わったら、子コンポーネント (RoutesやHeaderなど) を表示
  return <>{children}</>;
};