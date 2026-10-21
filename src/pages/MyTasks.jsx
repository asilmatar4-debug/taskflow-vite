import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../services/projectService';
import { listTasks, isOverdue, dateString } from '../services/taskService';
import PageHeader from '../components/PageHeader';
import { message } from '../utils/errors';
export default function MyTasks(){
 const{user}=useAuth();const[items,setItems]=useState([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[filter,setFilter]=useState('all');
 useEffect(()=>{let active=true;async function load(){try{const projects=await listProjects(user.uid);const groups=await Promise.all(projects.map(async p=>(await listTasks(p.id)).filter(t=>t.assigneeId===user.uid).map(t=>({...t,projectId:p.id,projectName:p.name}))));if(active)setItems(groups.flat());}catch(err){if(active)setError(message(err));}finally{if(active)setLoading(false);}}load();return()=>{active=false;};},[user.uid]);
 const shown=items.filter(t=>filter==='all'||(filter==='overdue'?isOverdue(t):t.status===filter));
 return <div className="page"><PageHeader title="My tasks" subtitle="Everything assigned to you in one place."/><div className="panel pad"><div className="filters"><label htmlFor="my-status" className="sr-only">Task status</label><select id="my-status" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All tasks</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option><option value="overdue">Overdue</option></select></div>{loading?<p>Loading tasks…</p>:error?<p className="error-box">{error}</p>:!shown.length?<p className="muted">No tasks match this filter.</p>:<div className="mini-projects">{shown.map(t=><Link key={`${t.projectId}-${t.id}`} to={`/projects/${t.projectId}`}><span className={`priority ${t.priority}`}>{t.priority}</span><span><strong>{t.title}</strong><small>{t.projectName} · {t.dueDate?dateString(t.dueDate):'No deadline'}</small></span><span className="chip">{t.status.replace('_',' ')}</span></Link>)}</div>}</div></div>;
}
