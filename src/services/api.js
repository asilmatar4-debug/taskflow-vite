import { auth } from '../firebase';
import { Timestamp } from 'firebase/firestore';

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function revive(value) {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === 'object') {
    if (Number.isInteger(value.seconds) && Number.isInteger(value.nanoseconds) && Object.keys(value).length === 2)
      return new Timestamp(value.seconds, value.nanoseconds);
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,revive(v)]));
  }
  return value;
}
export async function api(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  const token = await user.getIdToken();
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method: options.method || 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
  } catch { throw new Error('Cannot connect to TaskFlow API. Check that the backend is running on port 4000.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return revive(data);
}
