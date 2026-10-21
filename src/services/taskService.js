import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];
function tasksRef(id) { return collection(db, 'projects', id, 'tasks'); }
function taskRef(id, tid) { return doc(db, 'projects', id, 'tasks', tid); }
function fields(data) {
  const title = data.title.trim();
  const description = data.description.trim();
  if (title.length < 3 || title.length > 120) throw new Error('Title must be 3–120 characters.');
  if (description.length > 1000) throw new Error('Description must be under 1000 characters.');
  if (!statuses.includes(data.status) || !priorities.includes(data.priority)) throw new Error('Invalid status or priority.');
  let dueDate = null;
  if (data.dueDate) {
    const date = new Date(`${data.dueDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) throw new Error('Invalid due date.');
    const [y,m,d] = data.dueDate.split('-').map(Number);
    if (date.getFullYear() !== y || date.getMonth()+1 !== m || date.getDate() !== d) throw new Error('Invalid due date.');
    dueDate = Timestamp.fromDate(date);
  }
  return { title, description, status: data.status, priority: data.priority, dueDate, assigneeId: data.assigneeId || null };
}
export async function listTasks(id) {
  const snap = await getDocs(tasksRef(id));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
}
export function createTask(projectId, uid, data) {
  return addDoc(tasksRef(projectId), { ...fields(data), createdBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export function editTask(projectId, id, data) { return updateDoc(taskRef(projectId,id), { ...fields(data), updatedAt: serverTimestamp() }); }
export function changeStatus(projectId, id, status) {
  if (!statuses.includes(status)) throw new Error('Invalid status.');
  return updateDoc(taskRef(projectId,id), { status, updatedAt: serverTimestamp() });
}
export function removeTask(projectId, id) { return deleteDoc(taskRef(projectId,id)); }
export function dateString(timestamp) {
  if (!timestamp) return '';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function isOverdue(task) { return !!task.dueDate && task.status !== 'done' && dateString(task.dueDate) < dateString(new Date()); }
