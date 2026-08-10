import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Favorites from './pages/Favorites';
import Saved from './pages/Saved';
import ChatPage from './pages/ChatPage';
import CommunityPage from './pages/CommunityPage';
import About from './pages/About';
import Help from './pages/Help';
import UserByUsernameRedirect from './pages/UserByUsernameRedirect';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public route (redirect if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ChatProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />

            {/* Chat routes - standalone layout without global sidebars */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:id" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />

            {/* Protected routes with Layout (Sidebar + RightSidebar) */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/search" element={<div style={{ padding: '20px', color: 'white' }}>Search page coming soon...</div>} />
              <Route path="/r/:communityName" element={<CommunityPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:id" element={<Profile />} />
              <Route path="/u/:username" element={<UserByUsernameRedirect />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
            </ChatProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

