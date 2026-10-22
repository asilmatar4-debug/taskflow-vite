import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function emailKey(email) {
  return email.trim().toLowerCase();
}

// Both Google and email/password accounts need the same Firestore directory
// documents so project owners can add registered members by email.
async function ensureDirectoryProfile(user, preferredName) {
  if (!user.email) throw new Error('Your Google account did not provide an email address.');
  const email = emailKey(user.email);
  const displayName = (preferredName || user.displayName || email.split('@')[0]).trim();
  const userRef = doc(db, 'users', user.uid);
  const lookupRef = doc(db, 'userLookup', email);
  const [userSnap, lookupSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(lookupRef),
  ]);
  if (lookupSnap.exists() && lookupSnap.data().uid !== user.uid) {
    throw new Error('This email is already associated with a different user account.');
  }
  if (userSnap.exists() && lookupSnap.exists()) return;
  const batch = writeBatch(db);
  if (!userSnap.exists()) {
    batch.set(userRef, { displayName, email, createdAt: serverTimestamp() });
  }
  if (!lookupSnap.exists()) {
    batch.set(lookupRef, { uid: user.uid, displayName, email, createdAt: serverTimestamp() });
  }
  await batch.commit();
}

export async function register(name, email, password) {
  const displayName = name.trim();
  const cleanEmail = emailKey(email);
  if (displayName.length < 2 || displayName.length > 80) {
    throw new Error('Name must be 2–80 characters.');
  }
  const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  await updateProfile(user, { displayName });
  await ensureDirectoryProfile(user, displayName);
  return user;
}

export async function login(email, password) {
  const result = await signInWithEmailAndPassword(auth, emailKey(email), password);
  // Older accounts may have been created before the directory existed.
  await ensureDirectoryProfile(result.user);
  return result;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  await ensureDirectoryProfile(result.user);
  return result;
}

export function logout() {
  return signOut(auth);
}
