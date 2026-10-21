import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Users, ListTodo, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProject } from '../services/projectService';
import { listTasks, createTask, editTask, changeStatus, removeTask, isOverdue } from '../services/taskService';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskFilters from '../components/TaskFilters';
import { message } from '../utils/errors';

const initialFilters = { search: '', status: '', priority: '', assignee: '' };
export default function ProjectDetails(){
  const {id}=useParams();const{user}=useAuth();const[project,setProject]=useState(null);const[tasks,setTasks]=useState([]);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[notice,setNotice]=useState('');const[formOpen,setFormOpen]=useState(false);const[editing,setEditing]=useState(null);const[filters,setFilters]=useState(initialFilters);
  useEffect(()=>{let active=true;async function load(){try{const p=await getProject(id);if(!p){if(active)setError('Project not found.');return;}const data=await listTasks(id);if(active){setProject(p);setTasks(data);}}catch(err){if(active)setError(message(err));}finally{if(active)setLoading(false);}}load();return()=>{active=false;};},[id]);
  async function refresh(){const [p,data]=await Promise.all([getProject(id),listTasks(id)]);setProject(p);setTasks(data);}
  async function saveTask(data){if(editing){await editTask(id,editing.id,data);}else{await createTask(id,user.uid,data);}try{await refresh();setNotice('Task saved successfully.');}catch(err){setNotice(`Task saved; refresh to see it. ${message(err)}`);}setFormOpen(false);setEditing(null);}
  async function changeTaskStatus(task,status){setError('');try{await changeStatus(id,task.id,status);setTasks(old=>old.map(t=>t.id===task.id?{...t,status}:t));}catch(err){setError(message(err));}}
  async function deleteSelected(task){if(!window.confirm(`Delete “${task.title}”? This cannot be undone.`))return;setError('');try{await removeTask(id,task.id);setTasks(old=>old.filter(t=>t.id!==task.id));}catch(err){setError(message(err));}}
  if(loading)return <div className="page"><div className="panel pad">Loading project…</div></div>;
  if(error&&!project)return <div className="page"><div className="error-box">{error}</div><Link to="/projects">Back to projects</Link></div>;
  if(!project)return <div className="page">Project unavailable.</div>;
  const members=project.memberIds.map(uid=>({uid,name:project.memberNames?.[uid]||'Member'}));
  const done=tasks.filter(t=>t.status==='done').length;
  const matching=tasks.filter(t=>(!filters.search||t.title.toLowerCase().includes(filters.search.toLowerCase()))&&(!filters.status||(filters.status==='overdue'?isOverdue(t):t.status===filters.status))&&(!filters.priority||t.priority===filters.priority)&&(!filters.assignee||(filters.assignee==='unassigned'?!t.assigneeId:t.assigneeId===filters.assignee)));
  return <div className="page"><Link className="back-link" to="/projects"><ArrowLeft size={17}/>All projects</Link><div className="project-heading"><div><span className="eyebrow">PROJECT OVERVIEW</span><h1>{project.name}</h1><p>{project.description||'No description provided.'}</p></div>{project.ownerId===user.uid&&<Link to={`/projects/${id}/settings`} className="btn btn-outline"><Settings size={17}/>Settings</Link>}</div>
    <div className="stat-grid three"><div className="stat panel"><span className="stat-icon"><Users size={21}/></span><span>Team members</span><strong>{project.memberIds.length}</strong></div><div className="stat panel"><span className="stat-icon"><ListTodo size={21}/></span><span>All tasks</span><strong>{tasks.length}</strong></div><div className="stat panel"><span className="stat-icon"><CheckCircle2 size={21}/></span><span>Completion</span><strong>{tasks.length?Math.round(done/tasks.length*100):0}%</strong></div></div>
    <section className="panel pad tasks-section"><div className="section-head"><div><h2>Project tasks</h2><p>Stay on top of deadlines and deliverables.</p></div><button className="btn btn-primary" onClick={()=>{setEditing(null);setFormOpen(!formOpen);}}><Plus size={17}/>{formOpen?'Close form':'New task'}</button></div>
    {(formOpen||editing)&&<TaskForm key={editing?.id||'new'} task={editing} members={members} onCancel={()=>{setEditing(null);setFormOpen(false);}} onSave={saveTask}/>}
    <TaskFilters filters={filters} setFilters={setFilters} members={members}/>
    {notice&&<p role="status" className="success-box">{notice}</p>}{error&&<p role="alert" className="error-box">{error}</p>}
    <TaskList tasks={matching} user={user} ownerId={project.ownerId} memberNames={project.memberNames} onEdit={t=>{setFormOpen(false);setEditing(t);}} onDelete={deleteSelected} onStatus={changeTaskStatus}/></section></div>;
}
