import { collection, doc, addDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { emailKey } from './authService';

function validate(name, description) {
  name = name.trim(); description = description.trim();
  if (name.length < 3 || name.length > 80) throw new Error('Project name must be 3–80 characters.');
  if (description.length > 1000) throw new Error('Description must be under 1000 characters.');
  return { name, description };
}
export async function createProject(user, name, description) {
  const details = validate(name, description);
  return addDoc(collection(db, 'projects'), { ...details, ownerId: user.uid, memberIds: [user.uid], memberNames: { [user.uid]: user.displayName || user.email }, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function listProjects(uid) {
  const snap = await getDocs(query(collection(db, 'projects'), where('memberIds', 'array-contains', uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}
export async function getProject(id) {
  const snap = await getDoc(doc(db, 'projects', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export function upgradeLegacyProject(project, user) {
  if (project.ownerId !== user.uid) throw new Error('Only the owner can upgrade a project.');
  const names = Object.fromEntries(project.memberIds.map(uid => [uid, uid === user.uid ? (user.displayName || user.email) : 'Team Member']));
  return updateDoc(doc(db, 'projects', project.id), { memberNames: names, updatedAt: serverTimestamp() });
}
export function editProject(id, name, description) {
  return updateDoc(doc(db, 'projects', id), { ...validate(name, description), updatedAt: serverTimestamp() });
}
export async function addMember(project, email) {
  const found = await getDoc(doc(db, 'userLookup', emailKey(email)));
  if (!found.exists()) throw new Error('No registered user has this email.');
  const member = found.data();
  if (project.memberIds.includes(member.uid)) throw new Error('This user is already a member.');
  if (project.memberIds.length >= 20) throw new Error('A project supports up to 20 members.');
  await updateDoc(doc(db, 'projects', project.id), {
    memberIds: [...project.memberIds, member.uid],
    memberNames: { ...project.memberNames, [member.uid]: member.displayName },
    updatedAt: serverTimestamp()
  });
}
export async function removeMember(project, uid) {
  if (project.ownerId === uid) throw new Error('You cannot remove the project owner.');
  const tasks = await getDocs(collection(db, 'projects', project.id, 'tasks'));
  if (tasks.size > 400) throw new Error('Too many tasks for one batch. Contact the administrator.');
  const batch = writeBatch(db);
  tasks.docs.forEach(t => {
    if (t.data().assigneeId === uid) batch.update(t.ref, { assigneeId: null, updatedAt: serverTimestamp() });
  });
  const names = { ...project.memberNames }; delete names[uid];
  batch.update(doc(db, 'projects', project.id), {
    memberIds: project.memberIds.filter(id => id !== uid), memberNames: names, updatedAt: serverTimestamp()
  });
  await batch.commit();
}
// Deletion is intentionally restricted for the one-week MVP. See README.
export async function deleteEmptyProject() {
  throw new Error('Deletion is restricted until a server-side task cleanup workflow is configured.');
}
