import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useSetAtom } from 'jotai';
import { auth } from '../firebase/firebase';
import { userAtom } from '../store/auth';

// Firebaseの認証状態を監視し、JotaiのuserAtomを更新するコンポーネント
export const AuthObserver = () => {
  const setUser = useSetAtom(userAtom); // userAtomを更新する関数を取得

  useEffect(() => {
    // onAuthStateChangedは認証状態の変化を監視し、
    // ユーザーがログイン/ログアウトするたびにコールバック関数を実行
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // userオブジェクトが存在すればログイン中、nullならログアウト中
      setUser(user);
      console.log('認証状態が変化しました:', user ? user.uid : 'ログアウト');
    });

    // コンポーネントがアンマウントされるときに監視を停止（メモリリーク防止）
    return () => unsubscribe();
  }, [setUser]); // setUserが変更されたときのみ再実行

  return null; // このコンポーネントはUIを表示しないためnullを返す
};