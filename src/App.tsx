import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AuthObserver } from './components/AuthObserver'; // インポート
import { Header } from './components/Header'; // インポート
import './App.scss'; // 全体スタイル

function App() {
  return (
    <div className="container">
      {/* AuthObserverを最上位に配置し、認証状態を監視 */}
      <AuthObserver />

      {/* 全てのページで共通のヘッダー */}
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;