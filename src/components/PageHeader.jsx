export default function PageHeader({ eyebrow = 'WORKSPACE', title, subtitle, children }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{children && <div className="header-actions">{children}</div>}</header>;
}
