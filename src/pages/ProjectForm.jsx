import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../services/projectService';
import { message } from '../utils/errors';
export default function ProjectForm(){
 const{user}=useAuth();const navigate=useNavigate();const[name,setName]=useState('');const[description,setDescription]=useState('');const[error,setError]=useState('');const[saving,setSaving]=useState(false);
 async function submit(e){e.preventDefault();setSaving(true);setError('');try{const result=await createProject(user,name,description);navigate(`/projects/${result.id}`);}catch(err){setError(message(err));}finally{setSaving(false);}}
 return <div className="page narrow"><Link className="back-link" to="/projects"><ArrowLeft size={17}/>Back to projects</Link><div className="panel pad"><h1>Create a project</h1><p className="muted">Give your team a shared space to get things done.</p><form className="vertical-form" onSubmit={submit}><label className="field">Project name<input required minLength="3" maxLength="80" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Website Redesign"/></label><label className="field">Description (optional)<textarea maxLength="1000" rows="5" value={description} onChange={e=>setDescription(e.target.value)} placeholder="What are you working on?"/></label>{error&&<p className="error-box" role="alert">{error}</p>}<div className="form-actions"><Link className="btn btn-ghost" to="/projects">Cancel</Link><button className="btn btn-primary" disabled={saving}>{saving?'Creating…':'Create project'}</button></div></form></div></div>;
}
