import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../services/projectService';
import PageHeader from '../components/PageHeader';
import { message } from '../utils/errors';
export default function Projects(){
  const{user}=useAuth();const[projects,setProjects]=useState([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
  useEffect(()=>{let active=true;listProjects(user.uid).then(data=>{if(active)setProjects(data);}).catch(err=>{if(active)setError(message(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user.uid]);
  return <div className="page"><PageHeader title="Projects" subtitle="Every great project starts with a clear plan."><Link className="btn btn-primary" to="/projects/new"><Plus size={18}/>New project</Link></PageHeader>{loading?<div className="panel pad">Loading your projects…</div>:error?<p className="error-box">{error}</p>:!projects.length?<div className="panel empty"><FolderKanban size={39}/><h3>No projects yet</h3><p>Create your first project and start organizing work.</p><Link className="btn btn-primary" to="/projects/new">Create project</Link></div>:<div className="project-grid">{projects.map(p=><Link className="project-card panel" key={p.id} to={`/projects/${p.id}`}><span className="project-icon"><FolderKanban size={25}/></span><div className="project-title"><h2>{p.name}</h2><ArrowUpRight size={18}/></div><p>{p.description||'No description yet.'}</p><div className="project-footer"><span className="chip">{p.ownerId===user.uid?'Owner':'Member'}</span><span>{p.memberIds?.length||1} members</span></div></Link>)}</div>}</div>;
}
