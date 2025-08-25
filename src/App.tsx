import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/Header';
import { AuthGuard } from './components/AuthGuard'; // ★ 新しいAuthGuardをインポート
import './App.scss';

function App() {
  return (
    // ★ AuthGuardが認証状態を管理し、完了するまで子要素のレンダリングを待つ
    <AuthGuard>
      <div className="container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </AuthGuard>
  );
}

export default App;