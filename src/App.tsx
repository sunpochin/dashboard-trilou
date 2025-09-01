/**
 * 主應用程式組件
 * 負責處理用戶認證狀態的顯示邏輯，包含載入中、未登入、已登入三種狀態的頁面呈現
 * 未登入時顯示登入頁面，已登入時顯示 Dashboard 並提供登出功能
 */
import Dashboard from './Dashboard'
import GoogleLoginButton from './components/GoogleLoginButton'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f5f5f5' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #3498db', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f5f5f5' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1 style={{ marginBottom: '10px', color: '#333' }}>Trilou Dashboard</h1>
          <p style={{ marginBottom: '30px', color: '#666' }}>請登入以查看您的統計資料</p>
          <GoogleLoginButton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        backgroundColor: 'white',
        borderRadius: '0 0 0 12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{ color: '#666', fontSize: '14px' }}>
          {user.email}
        </span>
        <button
          onClick={signOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          登出
        </button>
      </div>
      <Dashboard />
    </>
  );
}

export default App
