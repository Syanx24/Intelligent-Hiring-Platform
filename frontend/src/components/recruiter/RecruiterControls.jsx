import { useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";

export function RecruiterSearch({
  value,
  onChange,
  placeholder = "Search by name or role...",
}) {
  return (
    <label className="rw-search">
      <Search size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function RecruiterFilter({ fields, filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  return (
    <div className="rw-filter-wrap">
      <button
        className="rw-button rw-filter-button"
        onClick={() => {
          setDraft(filters);
          setOpen(!open);
        }}
      >
        <Filter size={15} /> Filter <ChevronDown size={14} />
      </button>
      {open && (
        <div className="rw-filter-pop">
          {fields.map(({ key, label, options }) => (
            <label key={key}>
              {label}
              <select
                value={draft[key] || ""}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              >
                <option value="">All</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <div className="rw-filter-actions">
            <button
              onClick={() => {
                setDraft({});
                setFilters({});
              }}
            >
              Clear
            </button>
            <button
              className="rw-primary"
              onClick={() => {
                setFilters(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
