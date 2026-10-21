import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { login } from '../services/authService';
import { message } from '../utils/errors';
export default function Login() {
  const navigate = useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  async function submit(e) { e.preventDefault(); setLoading(true); setError(''); try { await login(email,password); navigate('/dashboard',{replace:true}); } catch(err){ setError(message(err)); } finally{setLoading(false);} }
  return <main className="auth-screen"><div className="auth-card"><div className="auth-logo"><span className="brand-icon"><Workflow size={25}/></span>TaskFlow</div><h1>Welcome back</h1><p className="muted">Sign in to your workspace to pick up where you left off.</p><form onSubmit={submit} className="auth-form"><label className="field">Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="field">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error && <p role="alert" className="error-box">{error}</p>}<button className="btn btn-primary wide" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><p className="auth-bottom">New to TaskFlow? <Link to="/register">Create an account</Link></p></div></main>;
}
