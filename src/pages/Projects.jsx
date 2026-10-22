import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, FolderKanban, ListTodo, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../services/projectService';
import { listTasks } from '../services/taskService';
import PageHeader from '../components/PageHeader';
import { message } from '../utils/errors';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const items = await listProjects(user.uid);
        if (active) setProjects(items);
        const results = await Promise.allSettled(items.map((project) => listTasks(project.id)));
        if (!active) return;
        const counts = {};
        items.forEach((project, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
            const tasks = result.value;
            counts[project.id] = {
              total: tasks.length,
              done: tasks.filter((task) => task.status === 'done').length,
            };
          }
        });
        setTaskCounts(counts);
      } catch (err) {
        if (active) setError(message(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user.uid]);

  return (
    <div className="page workspace-upgrade">
      <PageHeader eyebrow="WORKSPACE / PROJECTS" title="Projects" subtitle="Everything your team is working on, in one place.">
        <Link className="btn btn-primary" to="/projects/new"><Plus size={17} /> New project</Link>
      </PageHeader>

      {loading ? (
        <div className="panel pad">Loading your projects…</div>
      ) : error ? (
        <p className="error-box" role="alert">{error}</p>
      ) : !projects.length ? (
        <div className="panel empty"><FolderKanban size={36} /><h3>No projects yet</h3><p>Create your first project and start organizing work.</p><Link className="btn btn-primary" to="/projects/new">Create project</Link></div>
      ) : (
        <>
          <div className="projects-overview">
            <div><strong>{projects.length}</strong><span>{projects.length === 1 ? 'project' : 'projects'} in your workspace</span></div>
            <span>Keep your work organized and your team aligned.</span>
          </div>
          <div className="project-grid upgraded-project-grid">
            {projects.map((project) => {
              const counts = taskCounts[project.id];
              const percent = counts ? (counts.total ? Math.round((counts.done / counts.total) * 100) : 0) : null;
              return (
                <Link className="project-card panel upgraded-project-card" key={project.id} to={`/projects/${project.id}`}>
                  <div className="upgraded-project-top">
                    <span className="project-icon"><FolderKanban size={22} /></span>
                    <span className="project-open"><ArrowUpRight size={18} /></span>
                  </div>
                  <div className="upgraded-project-title">
                    <h2>{project.name}</h2>
                    <p>{project.description || 'No description added yet.'}</p>
                  </div>
                  <div className="upgraded-project-progress">
                    <div className="upgraded-project-progress-label">
                      <span>Progress</span>
                      <strong>{percent === null ? '—' : `${percent}%`}</strong>
                    </div>
                    <div className="progress-track"><span style={{ width: `${percent || 0}%` }} /></div>
                  </div>
                  <div className="upgraded-project-meta">
                    <span><Users size={14} /> {project.memberIds?.length || 1} members</span>
                    <span><ListTodo size={14} /> {counts ? counts.total : '—'} tasks</span>
                    <span><CheckCircle2 size={14} /> {counts ? counts.done : '—'} done</span>
                  </div>
                  <div className="project-footer">
                    <span className="chip">{project.ownerId === user.uid ? 'Owner' : 'Member'}</span>
                    <span>Open project <ArrowUpRight size={13} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
