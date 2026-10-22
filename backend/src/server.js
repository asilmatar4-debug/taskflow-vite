import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required.');
initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();
const auth = getAuth();
const app = express();
const PORT = Number(process.env.PORT || 4000);
app.disable('x-powered-by');
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x=>x.trim()) }));
app.use(express.json({ limit: '24kb' }));

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res)).catch(next);
const projectRef = id => db.collection('projects').doc(id);
const taskRef = (pid,tid) => projectRef(pid).collection('tasks').doc(tid);
const cleanId = val => { if(typeof val!=='string'||!val||val.includes('/')||val.length>150) fail(400,'Invalid ID'); return val; };
function serialize(value) {
  if (value instanceof Timestamp) return { seconds: value.seconds, nanoseconds: value.nanoseconds };
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,serialize(v)]));
  return value;
}
const record = snap => ({ id: snap.id, ...serialize(snap.data()) });
const trim = (s, min, max, label) => { if(typeof s!=='string') fail(400, `${label} is required`); const v=s.trim(); if(v.length<min||v.length>max) fail(400,`${label} must be ${min}–${max} characters`); return v; };
function details(body) { return { name: trim(body.name,3,80,'Project name'), description: trim(body.description??'',0,1000,'Description') }; }
function taskFields(body) {
  const title=trim(body.title,3,120,'Task title');
  const description=trim(body.description??'',0,1000,'Description');
  if(!['todo','in_progress','done'].includes(body.status)) fail(400,'Invalid status');
  if(!['low','medium','high'].includes(body.priority)) fail(400,'Invalid priority');
  const assigneeId=body.assigneeId||null;
  if(assigneeId!==null && (typeof assigneeId!=='string'||assigneeId.length>128)) fail(400,'Invalid assignee');
  let dueDate=null;
  if(body.dueDate){
    if(typeof body.dueDate!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(body.dueDate)) fail(400,'Invalid due date');
    const date=new Date(`${body.dueDate}T12:00:00.000Z`);
    if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==body.dueDate) fail(400,'Invalid due date');
    dueDate=Timestamp.fromDate(date);
  }
  return {title,description,status:body.status,priority:body.priority,assigneeId,dueDate};
}
async function guard(req, res, next) {
  try {
    const header=req.get('authorization')||'';
    if(!header.startsWith('Bearer ')) fail(401,'Sign in required');
    req.identity=await auth.verifyIdToken(header.slice(7));
    next();
  } catch(err) { next(err instanceof HttpError ? err : new HttpError(401,'Invalid or expired login session')); }
}
async function requireProject(pid,uid,{owner=false,active=false}={}) {
  const snap=await projectRef(cleanId(pid)).get();
  if(!snap.exists) fail(404,'Project not found');
  const p=snap.data();
  if(!Array.isArray(p.memberIds)||!p.memberIds.includes(uid)) fail(403,'Project access denied');
  if(owner&&p.ownerId!==uid) fail(403,'Only the owner can do this');
  if(active&&p.deleting===true) fail(409,'Project deletion is in progress');
  return p;
}
app.get('/api/health',(req,res)=>res.json({ok:true, service:'taskflow-api'}));
app.use('/api',guard);
app.get('/api/projects',wrap(async(req,res)=>{
  const snap=await db.collection('projects').where('memberIds','array-contains',req.identity.uid).get();
  res.json(snap.docs.map(record).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
}));
app.post('/api/projects',wrap(async(req,res)=>{
  const info=details(req.body); const uid=req.identity.uid;
  const doc=await db.collection('projects').add({...info,ownerId:uid,memberIds:[uid],memberNames:{[uid]:trim(req.identity.name||req.identity.email||'Member',1,80,'Display name')},createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  res.status(201).json({id:doc.id});
}));
app.get('/api/projects/:pid',wrap(async(req,res)=>{
  await requireProject(req.params.pid,req.identity.uid);
  res.json(record(await projectRef(req.params.pid).get()));
}));
app.patch('/api/projects/:pid',wrap(async(req,res)=>{
  await requireProject(req.params.pid,req.identity.uid,{owner:true,active:true});
  await projectRef(req.params.pid).update({...details(req.body),updatedAt:FieldValue.serverTimestamp()});
  res.json({ok:true});
}));
app.post('/api/projects/:pid/upgrade',wrap(async(req,res)=>{
  const p=await requireProject(req.params.pid,req.identity.uid,{owner:true,active:true});
  if(p.memberNames) return res.json({ok:true});
  const names=Object.fromEntries(p.memberIds.map(uid=>[uid,uid===req.identity.uid?(req.identity.name||req.identity.email||'Owner'):'Team Member']));
  await projectRef(req.params.pid).update({memberNames:names,updatedAt:FieldValue.serverTimestamp()});
  res.json({ok:true});
}));
app.post('/api/projects/:pid/members',wrap(async(req,res)=>{
  await requireProject(req.params.pid,req.identity.uid,{owner:true,active:true});
  const email=trim(req.body.email,3,254,'Email').toLowerCase();
  let member; try { member=await auth.getUserByEmail(email); } catch(e) { if(e.code==='auth/user-not-found') fail(404,'No registered user has this email'); throw e; }
  // Transaction prevents simultaneous invites from overwriting each other.
  await db.runTransaction(async tx=>{
    const ref=projectRef(req.params.pid); const snap=await tx.get(ref);
    if(!snap.exists) fail(404,'Project not found'); const p=snap.data();
    if(p.ownerId!==req.identity.uid||p.deleting) fail(403,'Project not editable');
    if(p.memberIds.includes(member.uid)) fail(409,'This user is already a member');
    if(p.memberIds.length>=20) fail(409,'A project supports up to 20 members');
    tx.update(ref,{memberIds:[...p.memberIds,member.uid],memberNames:{...(p.memberNames||{}),[member.uid]:member.displayName||member.email||'Member'},updatedAt:FieldValue.serverTimestamp()});
  });
  res.json({ok:true});
}));
app.delete('/api/projects/:pid/members/:uid',wrap(async(req,res)=>{
  const pid=req.params.pid, uid=cleanId(req.params.uid);
  const p=await requireProject(pid,req.identity.uid,{owner:true,active:true});
  if(uid===p.ownerId) fail(400,'Cannot remove owner');
  if(!p.memberIds.includes(uid)) fail(404,'Member not found');
  // Unassign tasks before removing membership; retries are safe.
  const snap=await projectRef(pid).collection('tasks').where('assigneeId','==',uid).get();
  for(let i=0;i<snap.docs.length;i+=400){const batch=db.batch();snap.docs.slice(i,i+400).forEach(t=>batch.update(t.ref,{assigneeId:null,updatedAt:FieldValue.serverTimestamp()}));await batch.commit();}
  await db.runTransaction(async tx=>{
    const ref=projectRef(pid), current=await tx.get(ref);if(!current.exists) fail(404,'Project not found');
    const data=current.data();if(data.ownerId!==req.identity.uid||data.deleting) fail(403,'Owner only');
    const names={...(data.memberNames||{})}; delete names[uid];
    tx.update(ref,{memberIds:data.memberIds.filter(id=>id!==uid),memberNames:names,updatedAt:FieldValue.serverTimestamp()});
  });
  res.json({ok:true});
}));
app.get('/api/projects/:pid/tasks',wrap(async(req,res)=>{
  await requireProject(req.params.pid,req.identity.uid);
  const snap=await projectRef(req.params.pid).collection('tasks').get();
  res.json(snap.docs.map(record).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
}));
app.post('/api/projects/:pid/tasks',wrap(async(req,res)=>{
  const p=await requireProject(req.params.pid,req.identity.uid,{active:true});
  const task=taskFields(req.body);
  if(task.assigneeId&&!p.memberIds.includes(task.assigneeId)) fail(400,'Assignee must be a member');
  const ref=projectRef(req.params.pid).collection('tasks').doc();
  await db.runTransaction(async tx => {
    const current=await tx.get(projectRef(req.params.pid));
    if(!current.exists) fail(404,'Project not found');
    const data=current.data();
    if(data.deleting||!data.memberIds.includes(req.identity.uid)) fail(403,'Project access denied or deletion started');
    if(task.assigneeId&&!data.memberIds.includes(task.assigneeId)) fail(400,'Assignee must be a member');
    tx.create(ref,{...task,createdBy:req.identity.uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  });
  res.status(201).json({id:ref.id});
}));
app.patch('/api/projects/:pid/tasks/:tid',wrap(async(req,res)=>{
  const p=await requireProject(req.params.pid,req.identity.uid,{active:true});
  const ref=taskRef(req.params.pid,cleanId(req.params.tid)), snap=await ref.get();
  if(!snap.exists) fail(404,'Task not found');
  const task=snap.data(),uid=req.identity.uid;
  if(p.ownerId!==uid && task.createdBy!==uid) fail(403,'Only owner or creator can edit task');
  const data=taskFields(req.body);
  if(data.assigneeId&&!p.memberIds.includes(data.assigneeId)) fail(400,'Assignee must be a member');
  await ref.update({...data,updatedAt:FieldValue.serverTimestamp()});res.json({ok:true});
}));
app.patch('/api/projects/:pid/tasks/:tid/status',wrap(async(req,res)=>{
  const p=await requireProject(req.params.pid,req.identity.uid,{active:true});
  const ref=taskRef(req.params.pid,cleanId(req.params.tid)),snap=await ref.get();if(!snap.exists) fail(404,'Task not found');
  const t=snap.data();if(p.ownerId!==req.identity.uid&&t.createdBy!==req.identity.uid&&t.assigneeId!==req.identity.uid) fail(403,'Status edit denied');
  if(!['todo','in_progress','done'].includes(req.body.status)) fail(400,'Invalid status');
  await ref.update({status:req.body.status,updatedAt:FieldValue.serverTimestamp()});res.json({ok:true});
}));
app.delete('/api/projects/:pid/tasks/:tid',wrap(async(req,res)=>{
  const p=await requireProject(req.params.pid,req.identity.uid,{active:true});
  const ref=taskRef(req.params.pid,cleanId(req.params.tid)),snap=await ref.get();if(!snap.exists) fail(404,'Task not found');
  if(p.ownerId!==req.identity.uid&&snap.data().createdBy!==req.identity.uid) fail(403,'Task delete denied');
  await ref.delete();res.json({ok:true});
}));
// Server-controlled deletion. Admin SDK deletes tasks first, then project.
app.delete('/api/projects/:pid',wrap(async(req,res)=>{
  const pid=req.params.pid;await requireProject(pid,req.identity.uid,{owner:true});
  const ref=projectRef(pid);
  await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)fail(404,'Project not found');if(snap.data().ownerId!==req.identity.uid)fail(403,'Owner only');tx.update(ref,{deleting:true,updatedAt:FieldValue.serverTimestamp()});});
  while(true){const snap=await ref.collection('tasks').limit(200).get();if(snap.empty)break;const batch=db.batch();snap.docs.forEach(t=>batch.delete(t.ref));await batch.commit();}
  await ref.delete();res.json({ok:true});
}));
app.use((req,res)=>res.status(404).json({error:'Route not found'}));
app.use((err,req,res,next)=>{
  if(err instanceof SyntaxError && 'body' in err) return res.status(400).json({error:'Invalid JSON'});
  const status=err.status||500;
  if(status>=500) console.error(err);
  res.status(status).json({error:status>=500?'Internal server error':err.message});
});
app.listen(PORT,()=>console.log(`TaskFlow API ready: http://localhost:${PORT}/api/health`));
