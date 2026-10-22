import { api } from './api';
const enc = encodeURIComponent;
export const createProject = (user,name,description) => api('/projects',{method:'POST',body:{name,description}});
export const listProjects = () => api('/projects');
export const getProject = id => api(`/projects/${enc(id)}`);
export const editProject = (id,name,description) => api(`/projects/${enc(id)}`,{method:'PATCH',body:{name,description}});
export const upgradeLegacyProject = project => api(`/projects/${enc(project.id)}/upgrade`,{method:'POST'});
export const addMember = (project,email) => api(`/projects/${enc(project.id)}/members`,{method:'POST',body:{email}});
export const removeMember = (project,uid) => api(`/projects/${enc(project.id)}/members/${enc(uid)}`,{method:'DELETE'});
export const deleteProjectAndTasks = async (projectId,currentUserId,onProgress) => {
  onProgress?.('Deleting project and its tasks securely on the server…');
  return api(`/projects/${enc(projectId)}`,{method:'DELETE'});
};
