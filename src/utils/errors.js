export function message(error) {
  const texts = {
    'permission-denied': 'Access denied. You do not have permission to perform this action.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/weak-password': 'Please choose a stronger password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/network-request-failed': 'Network error. Check your connection and retry.',
  };
  return texts[error?.code] || error?.message || 'Something went wrong. Please retry.';
}
