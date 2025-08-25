import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app'; // ★ Firebaseの具体的なエラー型をインポート
import '../styles/LoginPage.scss';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 実行時に一度エラーメッセージをリセット
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: unknown) {
      // ★ errがFirebaseErrorかどうかを判定
      if (err instanceof FirebaseError) {
        // エラーコードに応じて、より分かりやすいメッセージを表示
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('このメールアドレスは既に使用されています。');
            break;
          case 'auth/weak-password':
            setError('パスワードは6文字以上で設定してください。');
            break;
          case 'auth/invalid-email':
            setError('有効なメールアドレスを入力してください。');
            break;
          default:
            setError('登録に失敗しました。');
            break;
        }
      } else {
        // Firebase以外の予期せぬエラー
        setError('予期せぬエラーが発生しました。');
      }
      console.error('登録エラー:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 実行時に一度エラーメッセージをリセット
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: unknown) {
      // ★ ログイン失敗の場合は、セキュリティのため理由は特定せず、汎用的なメッセージを表示
      setError('メールアドレスまたはパスワードが間違っています。');
      console.error('ログインエラー:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>ログイン / 新規登録</h2>
        <form>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="button-group">
            <button type="submit" onClick={handleLogin}>
              ログイン
            </button>
            <button type="submit" onClick={handleSignUp} className="secondary">
              新規登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};