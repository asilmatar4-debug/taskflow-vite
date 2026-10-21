import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectDetails from './pages/ProjectDetails';
import ProjectSettings from './pages/ProjectSettings';
import MyTasks from './pages/MyTasks';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Checking your session…</div>;
  return user ? children : <Navigate to="/login" replace />;
}
function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<Guest><Login /></Guest>} />
    <Route path="/register" element={<Guest><Register /></Guest>} />
    <Route element={<RequireAuth><Layout /></RequireAuth>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/new" element={<ProjectForm />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/projects/:id/settings" element={<ProjectSettings />} />
      <Route path="/tasks" element={<MyTasks />} />
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<div className="center-screen"><h1>404 — Page not found</h1></div>} />
  </Routes>;
}
