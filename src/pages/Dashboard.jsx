import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, Clock3,
  FolderKanban, ListTodo, Plus, Sparkles, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../services/projectService';
import { dateString, isOverdue, listTasks } from '../services/taskService';
import PageHeader from '../components/PageHeader';
import { message } from '../utils/errors';

const statusNames = { todo: 'To do', in_progress: 'In progress', done: 'Done' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const projects = await listProjects(user.uid);
        const results = await Promise.all(
          projects.map(async (project) => {
            const tasks = await listTasks(project.id);
            return tasks.map((task) => ({
              ...task,
              projectId: project.id,
              projectName: project.name,
            }));
          })
        );
        if (active) setData({ projects, tasks: results.flat() });
      } catch (err) {
        if (active) setError(message(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user.uid]);

  const { projects, tasks } = data;
  const done = tasks.filter((task) => task.status === 'done').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const overdue = tasks.filter(isOverdue).length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const recentTasks = [...tasks]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 6);

  const stats = [
    { label: 'Projects', value: projects.length, icon: FolderKanban },
    { label: 'Total tasks', value: tasks.length, icon: ListTodo },
    { label: 'In progress', value: inProgress, icon: Clock3 },
    { label: 'Completed', value: done, icon: CheckCircle2 },
    { label: 'Overdue', value: overdue, icon: CalendarClock },
  ];

  return (
    <div className="page workspace-upgrade">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title={`Welcome back, ${(user.displayName || 'there').split(' ')[0]}`}
        subtitle="A clear view of what matters today."
      >
        <Link className="btn btn-primary" to="/projects/new">
          <Plus size={17} /> New project
        </Link>
      </PageHeader>

      {loading ? (
        <div className="panel pad">Loading workspace…</div>
      ) : error ? (
        <p className="error-box" role="alert">{error}</p>
      ) : (
        <>
          <div className="workspace-summary">
            <div>
              <span className="workspace-summary-kicker"><Sparkles size={15} /> AT A GLANCE</span>
              <h2>Make progress, one task at a time.</h2>
              <p>{tasks.length ? `${done} of ${tasks.length} tasks completed across your workspace.` : 'Create your first project to get started.'}</p>
            </div>
            <div className="workspace-summary-progress" aria-label={`${completion}% of tasks completed`}>
              <strong>{completion}%</strong>
              <span>Overall completion</span>
              <div className="progress-track"><div style={{ width: `${completion}%` }} /></div>
            </div>
          </div>

          <div className="stat-grid">
            {stats.map(({ label, value, icon: Icon }) => (
              <div className="panel stat" key={label}>
                <span className="stat-icon"><Icon size={20} /></span>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="workspace-columns">
            <section className="panel pad workspace-tasks">
              <div className="section-head">
                <div>
                  <span className="eyebrow">YOUR ACTIVITY</span>
                  <h2>Recent tasks</h2>
                  <p>Pick up where you left off.</p>
                </div>
                <Link className="text-link" to="/tasks">My tasks <ArrowUpRight size={15} /></Link>
              </div>
              {recentTasks.length ? (
                <div className="workspace-task-list">
                  {recentTasks.map((task) => (
                    <Link className="workspace-task" key={`${task.projectId}-${task.id}`} to={`/projects/${task.projectId}`}>
                      <span className={`task-status-dot status-${task.status}`} />
                      <span className="workspace-task-content">
                        <strong>{task.title}</strong>
                        <small>{task.projectName}{task.dueDate ? ` · Due ${dateString(task.dueDate)}` : ''}</small>
                      </span>
                      <span className={`workspace-status status-${task.status}`}>{statusNames[task.status] || task.status}</span>
                      <ArrowUpRight className="workspace-task-arrow" size={16} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty"><ListTodo size={30} /><h3>No tasks yet</h3><p>Open a project and add your first task.</p></div>
              )}
            </section>

            <section className="panel pad workspace-projects">
              <div className="section-head">
                <div>
                  <span className="eyebrow">KEEP MOVING</span>
                  <h2>Your projects</h2>
                  <p>Jump into your active work.</p>
                </div>
                <Link className="text-link" to="/projects">View all <ArrowRight size={15} /></Link>
              </div>
              {projects.length ? (
                <div className="workspace-project-list">
                  {projects.slice(0, 4).map((project) => {
                    const projectTasks = tasks.filter((task) => task.projectId === project.id);
                    const completed = projectTasks.filter((task) => task.status === 'done').length;
                    const percent = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;
                    return (
                      <Link className="workspace-project" to={`/projects/${project.id}`} key={project.id}>
                        <span className="project-icon mini"><FolderKanban size={17} /></span>
                        <span className="workspace-project-body">
                          <strong>{project.name}</strong>
                          <small><Users size={12} /> {project.memberIds?.length || 1} members · {projectTasks.length} tasks</small>
                          <span className="progress-track"><span style={{ width: `${percent}%` }} /></span>
                        </span>
                        <span className="workspace-project-percent">{percent}%</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="empty"><FolderKanban size={30} /><h3>No projects yet</h3><p>Start by creating your first project.</p></div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
