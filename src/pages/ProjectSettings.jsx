import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserMinus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProject, editProject, addMember, removeMember, upgradeLegacyProject } from '../services/projectService';
import { message } from '../utils/errors';
export default function ProjectSettings(){
  const{id}=useParams();const{user}=useAuth();const[project,setProject]=useState(null);const[name,setName]=useState('');const[description,setDescription]=useState('');const[email,setEmail]=useState('');const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);const[error,setError]=useState('');const[notice,setNotice]=useState('');
  useEffect(()=>{let active=true;getProject(id).then(p=>{if(active){setProject(p);if(p){setName(p.name);setDescription(p.description);}}}).catch(err=>{if(active)setError(message(err));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id]);
  async function refresh(){setProject(await getProject(id));}
  async function perform(action,success){setSaving(true);setError('');setNotice('');try{await action();await refresh();setNotice(success);}catch(err){setError(message(err));}finally{setSaving(false);}}
  if(loading)return <div className="page">Loading settings…</div>;
  if(error&&!project)return <div className="page error-box">{error}</div>;
  if(!project)return <div className="page">Project not found.</div>;
  if(project.ownerId!==user.uid)return <div className="page"><h1>Access denied</h1><p>Only the owner can manage this project.</p></div>;
  return <div className="page narrow"><Link className="back-link" to={`/projects/${id}`}><ArrowLeft size={17}/>Back to project</Link><div className="panel pad"><span className="eyebrow">OWNER ONLY</span><h1>Project settings</h1><p className="muted">Manage project details and team access.</p>
    <form className="vertical-form" onSubmit={e=>{e.preventDefault();perform(()=>editProject(id,name,description),'Changes saved.');}}><label className="field">Project name<input value={name} onChange={e=>setName(e.target.value)} required minLength="3" maxLength="80"/></label><label className="field">Description<textarea rows="3" maxLength="1000" value={description} onChange={e=>setDescription(e.target.value)}/></label><button disabled={saving} className="btn btn-primary">Save changes</button></form>
    {!project.memberNames && <div className="success-box"><p>This project was created in the older Next.js version. Upgrade its team metadata before editing or inviting members.</p><button className="btn btn-outline" disabled={saving} onClick={()=>perform(()=>upgradeLegacyProject(project,user),'Project metadata upgraded.')}>Upgrade old project</button></div>}
    <hr className="section-rule"/><h2>Team members</h2><p className="muted">Invite-free MVP: add an existing registered account by email.</p>
    <form className="inline-form" onSubmit={e=>{e.preventDefault();perform(async()=>{await addMember(project,email);setEmail('');},'Member added.');}}><label className="sr-only" htmlFor="member-email">Member email</label><input id="member-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="teammate@example.com"/><button disabled={saving} className="btn btn-primary"><UserPlus size={16}/>Add member</button></form>
    <div className="members-list">{project.memberIds.map(uid=><div className="member-line" key={uid}><div><span className="avatar small">{(project.memberNames?.[uid]||'U')[0]}</span><strong>{project.memberNames?.[uid]||'Member'}</strong>{uid===project.ownerId&&<span className="chip">Owner</span>}</div>{uid!==project.ownerId&&<button className="icon-btn danger" disabled={saving} onClick={()=>{if(window.confirm('Remove member? Assigned tasks will become unassigned.'))perform(()=>removeMember(project,uid),'Member removed.');}} aria-label={`Remove ${project.memberNames?.[uid]||'member'}`}><UserMinus size={19}/></button>}</div>)}</div>
    {notice&&<p role="status" className="success-box">{notice}</p>}{error&&<p role="alert" className="error-box">{error}</p>}
    <div className="danger-zone"><div><ShieldAlert size={21}/><h2>Project deletion restricted</h2></div><p>For this MVP, deletion is disabled after task support is enabled, to prevent leaving orphaned Firestore subcollection documents. This limitation is explicitly documented.</p></div>
  </div></div>;
}
