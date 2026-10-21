import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function emailKey(email) { return email.trim().toLowerCase(); }
export async function register(name, email, password) {
  const displayName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (displayName.length < 2 || displayName.length > 80) throw new Error('Name must be 2–80 characters.');
  const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  await updateProfile(user, { displayName });
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', user.uid), { displayName, email: cleanEmail, createdAt: serverTimestamp() });
  batch.set(doc(db, 'userLookup', emailKey(cleanEmail)), { uid: user.uid, displayName, email: cleanEmail, createdAt: serverTimestamp() });
  await batch.commit();
  return user;
}
export async function login(email, password) {
  const credentials = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  // Existing accounts created before this Vite migration may lack a lookup record.
  // A failed lookup does not block login; the user can retry later.
  try {
    const user = credentials.user;
    const reference = doc(db, 'userLookup', emailKey(user.email));
    if (!(await getDoc(reference)).exists()) {
      const displayName = user.displayName || user.email.split('@')[0];
      await setDoc(reference, { uid: user.uid, email: user.email.toLowerCase(), displayName, createdAt: serverTimestamp() });
    }
  } catch (error) { console.warn('Directory profile sync skipped:', error); }
  return credentials;
}
export function logout() { return signOut(auth); }
