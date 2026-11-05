import {
  Briefcase,
  Check,
  ChevronLeft,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Menu,
  Users,
} from "lucide-react";

const sections = [
  ["Dashboard", LayoutDashboard],
  ["My Jobs", Briefcase],
  ["Applications", Users],
  ["Shortlisted", ListChecks],
  ["Test", Check],
  ["Interview", Clock3],
];

export default function SidebarRecruiter({
  section,
  collapsed,
  jobs,
  apps,
  user,
  onToggleCollapsed,
  onNavigate,
}) {
  return (
    <aside className="rw-sidebar">
      <button
        className="rw-collapse"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        type="button"
      >
        <Menu size={18} />
        {!collapsed && <ChevronLeft size={15} />}
      </button>

      {!collapsed && <div className="rw-nav-title">WORKSPACE</div>}
      <nav aria-label="Recruiter workspace">
        {sections.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            className={section === name ? "active" : ""}
            onClick={() => onNavigate(name)}
            title={collapsed ? `${name}${name === "My Jobs" ? ` (${jobs.length})` : ""}` : undefined}
            aria-current={section === name ? "page" : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{name}</span>}
            {!collapsed && name === "My Jobs" && <i>{jobs.length}</i>}
            {!collapsed && name === "Applications" && apps.length > 0 && (
              <i>{apps.length}</i>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
