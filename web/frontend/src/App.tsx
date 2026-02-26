import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { ConfigPage } from './pages/ConfigPage';
import { LogsPage } from './pages/LogsPage';
import { SkillsPage } from './pages/SkillsPage';
import { SessionsPage } from './pages/SessionsPage';
import { MemoryPage } from './pages/MemoryPage';
import { ToolsPage } from './pages/ToolsPage';
import { GatewayPage } from './pages/GatewayPage';
import { CronPage } from './pages/CronPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:sessionId" element={<ChatPage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/memory" element={<MemoryPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/gateway" element={<GatewayPage />} />
              <Route path="/cron" element={<CronPage />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
        <ConfirmDialog />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
