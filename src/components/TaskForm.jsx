import { useState } from 'react';
import { dateString } from '../services/taskService';
import { message } from '../utils/errors';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '' };
export default function TaskForm({ task, members, onSave, onCancel }) {
  const [form, setForm] = useState(() => task ? { ...empty, ...task, dueDate: dateString(task.dueDate), assigneeId: task.assigneeId || '' } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError(''); setSaving(true);
    try { await onSave(form); }
    catch (err) { setError(message(err)); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="panel form-panel">
    <div className="form-head"><div><h2>{task ? 'Edit task' : 'Create a task'}</h2><p>Keep the team aligned with a clear next step.</p></div></div>
    <div className="form-grid">
      <label className="field full">Task title <input required minLength="3" maxLength="120" name="title" value={form.title} onChange={change} placeholder="e.g. Build navigation bar"/></label>
      <label className="field full">Description <textarea maxLength="1000" rows="3" name="description" value={form.description} onChange={change} placeholder="What needs to be done?"/></label>
      <label className="field">Status <select name="status" value={form.status} onChange={change}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></label>
      <label className="field">Priority <select name="priority" value={form.priority} onChange={change}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <label className="field">Due date <input name="dueDate" type="date" value={form.dueDate} onChange={change}/></label>
      <label className="field">Assignee <select name="assigneeId" value={form.assigneeId} onChange={change}><option value="">Unassigned</option>{members.map(m=><option key={m.uid} value={m.uid}>{m.name}</option>)}</select></label>
    </div>
    {error && <p role="alert" className="error-box">{error}</p>}
    <div className="form-actions"><button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
  </form>;
}
