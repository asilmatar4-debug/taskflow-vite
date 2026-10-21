import { Pencil, Trash2, CalendarDays, ListTodo } from 'lucide-react';
import { dateString, isOverdue } from '../services/taskService';
const labels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
export default function TaskList({ tasks, user, ownerId, memberNames = {}, onEdit, onDelete, onStatus }) {
  if (!tasks.length) return <div className="empty"><ListTodo size={35}/><h3>No matching tasks</h3><p>Try another filter or create a new task.</p></div>;
  return <div className="task-list">{tasks.map(t=>{
    const owner = ownerId === user.uid;
    const canEdit = owner || t.createdBy === user.uid;
    const canDelete = owner || t.createdBy === user.uid;
    const canStatus = owner || t.assigneeId === user.uid;
    return <article className="task-card" key={t.id}>
      <div className="task-body"><div className="task-title-row"><h3>{t.title}</h3><span className={`priority ${t.priority}`}>{t.priority}</span>{isOverdue(t) && <span className="priority overdue">Overdue</span>}</div>{t.description && <p>{t.description}</p>}
        <div className="task-meta"><span><CalendarDays size={15}/>{t.dueDate ? dateString(t.dueDate) : 'No due date'}</span><span>Assigned: {t.assigneeId ? memberNames[t.assigneeId] || 'Former member' : 'Unassigned'}</span></div></div>
      <div className="task-actions"><select aria-label={`Status of ${t.title}`} value={t.status} disabled={!canStatus} onChange={e=>onStatus(t,e.target.value)}>{Object.entries(labels).map(([key,text])=><option key={key} value={key}>{text}</option>)}</select>{canEdit && <button className="icon-btn" aria-label={`Edit ${t.title}`} onClick={()=>onEdit(t)}><Pencil size={18}/></button>}{canDelete && <button className="icon-btn danger" aria-label={`Delete ${t.title}`} onClick={()=>onDelete(t)}><Trash2 size={18}/></button>}</div>
    </article>;
  })}</div>;
}
