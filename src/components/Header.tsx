import { Link, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../store/auth';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import '../styles/Header.scss'; // 新しいスタイルシートをインポート

export const Header = () => {
  const user = useAtomValue(userAtom); // Jotaiからユーザー情報を取得
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebaseからログアウト
      navigate('/login'); // ログアウト後、ログインページに遷移
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました。');
    }
  };

  return (
    <header className="app-header">
      <Link to="/" className="app-logo">
        AI Tool Map
      </Link>
      <nav className="main-nav">
        {user ? ( // ユーザーがログインしている場合
          <>
            <span className="user-info">ようこそ、{user.email}さん！</span>
            <button onClick={handleLogout} className="logout-button">
              ログアウト
            </button>
          </>
        ) : ( // ユーザーがログインしていない場合
          <Link to="/login" className="login-button">
            ログイン / 新規登録
          </Link>
        )}
      </nav>
    </header>
  );
};