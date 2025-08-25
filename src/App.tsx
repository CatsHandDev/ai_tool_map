import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/Header';
import { AuthGuard } from './components/AuthGuard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import './App.scss';

function App() {
  const location = useLocation();

  return (
    // AuthGuardが認証状態を管理し、完了するまで子要素のレンダリングを待つ
    <AuthGuard>
      {/* ログインページではヘッダーを表示しない、などの条件分岐も可能 */}
      {location.pathname !== '/login' && <Header />}

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
        </Routes>
      </div>
    </AuthGuard>
  );
}

export default App;