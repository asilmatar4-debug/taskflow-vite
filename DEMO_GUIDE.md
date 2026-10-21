# Demo script & code review

1. Introduce: TaskFlow helps small teams manage projects and assign tasks.
2. Explain architecture: React renders components, Vite runs dev/build, Router switches screens, Firebase Authentication manages sessions, and Firestore stores data.
3. Show sign-in, create project, add existing member, create task, change status and filter overdue.
4. Show Firestore nested collections; explain `ownerId`, `memberIds` and security rules.
5. Explain role checks: a button being hidden is UI only; Firestore rules reject unauthorized writes.
6. Explain `useState` for form inputs, `useEffect` for initial data loading, and cleanup to avoid stale updates.
7. Mention the deliberately restricted project delete operation to avoid orphaned subcollections.
8. Be prepared to implement an overdue filter using `task.dueDate && task.status !== 'done' && dateString(task.dueDate) < dateString(new Date())`.

Practice the code yourself and be ready to show a real modification live, rather than memorizing generated answers.
