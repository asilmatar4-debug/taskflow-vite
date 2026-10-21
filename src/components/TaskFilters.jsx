export default function TaskFilters({ filters, setFilters, members = [] }) {
  function change(e) { setFilters({ ...filters, [e.target.name]: e.target.value }); }
  return <div className="filters">
    <label className="sr-only" htmlFor="task-search">Search tasks</label><input id="task-search" name="search" value={filters.search} onChange={change} placeholder="Search task titles…" />
    <label className="sr-only" htmlFor="status-filter">Filter by status</label><select id="status-filter" name="status" value={filters.status} onChange={change}><option value="">All statuses</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option><option value="overdue">Overdue</option></select>
    <label className="sr-only" htmlFor="priority-filter">Filter by priority</label><select id="priority-filter" name="priority" value={filters.priority} onChange={change}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
    <label className="sr-only" htmlFor="assignee-filter">Filter by assignee</label><select id="assignee-filter" name="assignee" value={filters.assignee} onChange={change}><option value="">All assignees</option><option value="unassigned">Unassigned</option>{members.map(m=><option key={m.uid} value={m.uid}>{m.name}</option>)}</select>
  </div>;
}
