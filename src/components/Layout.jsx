import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListTodo, Workflow, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const links = [ ['/dashboard', 'Dashboard', LayoutDashboard], ['/projects', 'Projects', FolderKanban], ['/tasks','My Tasks', ListTodo] ];
export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    try { await logout(); navigate('/login', { replace: true }); }
    catch { setError('Could not sign out. Please retry.'); }
  }
  return <div className="app-shell">
    <button type="button" className="mobile-menu" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={23}/></button>
    {menu && <button aria-label="Close navigation" className="menu-backdrop" onClick={()=>setMenu(false)}/>}
    <aside className={`sidebar ${menu ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><NavLink to="/dashboard" className="logo" onClick={()=>setMenu(false)}><span className="brand-icon"><Workflow size={24}/></span><span>TaskFlow</span></NavLink><button className="sidebar-close" aria-label="Close menu" onClick={()=>setMenu(false)}><X size={20}/></button></div>
      <span className="sidebar-label">WORKSPACE</span>
      <nav>{links.map(([url,title,Icon])=><NavLink key={url} to={url} onClick={()=>setMenu(false)} className={({isActive})=>`nav-link ${isActive ? 'active' : ''}`}><Icon size={19}/>{title}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-block"><span className="avatar">{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</span><div><strong>{user?.displayName || 'TaskFlow User'}</strong><small>{user?.email}</small></div></div><button className="nav-link logout" onClick={signOut}><LogOut size={19}/>Log out</button>{error && <small className="error">{error}</small>}</div>
    </aside>
    <main className="app-main"><Outlet /></main>
  </div>;
}
