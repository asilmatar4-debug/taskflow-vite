import { api } from './api';
const enc=encodeURIComponent;
export const listTasks = projectId => api(`/projects/${enc(projectId)}/tasks`);
export const createTask = (projectId,uid,data) => api(`/projects/${enc(projectId)}/tasks`,{method:'POST',body:data});
export const editTask = (projectId,id,data) => api(`/projects/${enc(projectId)}/tasks/${enc(id)}`,{method:'PATCH',body:data});
export const changeStatus = (projectId,id,status) => api(`/projects/${enc(projectId)}/tasks/${enc(id)}/status`,{method:'PATCH',body:{status}});
export const removeTask = (projectId,id) => api(`/projects/${enc(projectId)}/tasks/${enc(id)}`,{method:'DELETE'});
export function dateString(timestamp) {
  if(!timestamp)return '';
  const d=timestamp.toDate?timestamp.toDate():new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export const isOverdue = task => Boolean(task.dueDate)&&task.status!=='done'&&dateString(task.dueDate)<dateString(new Date());
