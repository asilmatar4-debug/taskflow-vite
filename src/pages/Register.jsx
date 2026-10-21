import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Workflow } from 'lucide-react';
import { register } from '../services/authService';
import { message } from '../utils/errors';
export default function Register() {
  const navigate=useNavigate(); const [name,setName]=useState(''); const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');const[loading,setLoading]=useState(false);
  async function submit(e){ e.preventDefault();setLoading(true);setError('');try{await register(name,email,password);navigate('/dashboard',{replace:true});}catch(err){setError(message(err));}finally{setLoading(false);} }
  return <main className="auth-screen"><div className="auth-card"><div className="auth-logo"><span className="brand-icon"><Workflow size={25}/></span>TaskFlow</div><h1>Create your account</h1><p className="muted">One place for your team, projects and tasks.</p><form onSubmit={submit} className="auth-form"><label className="field">Full name<input autoComplete="name" minLength="2" maxLength="80" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label className="field">Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="field">Password<input type="password" autoComplete="new-password" minLength="6" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></label>{error && <p role="alert" className="error-box">{error}</p>}<button className="btn btn-primary wide" disabled={loading}>{loading?'Creating account…':'Create account'}</button></form><p className="auth-bottom">Already have an account? <Link to="/login">Sign in</Link></p></div></main>;
}
