import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Code2,
  ExternalLink,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Github,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { getGithubSummary } from "../service/candidate/candidateAPI.js";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString();
};

export default function GitHubSummaryCard({ githubUrl = "", onAddGithub }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const profileUrl = githubUrl.trim();

  const loadSummary = async () => {
    if (!profileUrl) return;
    setLoading(true);
    setError("");
    try {
      setSummary(await getGithubSummary(profileUrl));
    } catch (requestError) {
      setError(requestError.message || "Could not load GitHub summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="github-summary-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">GitHub Summary</p>
          <p className="mt-1 text-xs text-slate-500">Public profile and repository details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {summary && (
            <button
              type="button"
              onClick={() => setMinimized((value) => !value)}
              aria-expanded={!minimized}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              {minimized ? "Show summary" : "Hide summary"}
            </button>
          )}
          {profileUrl ? (
            <button
              type="button"
              disabled={loading}
              onClick={loadSummary}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {loading && <RefreshCw size={13} className="animate-spin" />}
              {loading ? "Loading…" : summary ? "Refresh summary" : "Load summary"}
            </button>
          ) : onAddGithub ? (
            <button type="button" onClick={onAddGithub} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">Add GitHub</button>
          ) : (
            <span className="text-xs text-slate-400">No GitHub profile linked</span>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-rose-700" role="alert">{error}</p>}
      {!profileUrl && <p className="mt-3 text-xs text-slate-500">A public GitHub profile link is not available.</p>}
      {summary && minimized && <p className="mt-3 text-xs text-slate-500">Summary hidden. Select “Show summary” to view it.</p>}
      {summary && !minimized && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3">
            {summary.avatarUrl ? <img src={summary.avatarUrl} alt={`${summary.login} profile`} className="h-12 w-12 rounded-full object-cover" /> : <Github size={36} className="text-slate-400" />}
            <div className="min-w-0">
              <a href={summary.profileUrl} target="_blank" rel="noreferrer" className="font-semibold text-sm text-slate-900 hover:text-blue-700">{summary.name || summary.login} <ExternalLink size={12} className="inline" /></a>
              <p className="text-xs text-slate-500">@{summary.login}</p>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{summary.bio || "No bio provided."}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryMetric icon={Users} label="Followers" value={summary.followers} />
            <SummaryMetric icon={BookOpen} label="Public repos" value={summary.publicRepos} />
            <SummaryMetric icon={Star} label="Stars (top 5)" value={summary.totalStars} />
            <SummaryMetric icon={Github} label="Name" value={summary.name || "Not provided"} />
          </div>
          {summary.repositories?.length > 0 ? (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">Recent repositories</h4>
              <ul className="grid gap-2">
                {summary.repositories.slice(0, 5).map((repo) => (
                  <li key={repo.url} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <a href={repo.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-800 hover:text-blue-700">{repo.name} <ExternalLink size={11} className="inline" /></a>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span><Star size={11} className="mr-1 inline" />{repo.stars ?? 0}</span>
                        <span><GitFork size={11} className="mr-1 inline" />{repo.forks ?? 0}</span>
                        <span><GitCommitHorizontal size={12} className="mr-1 inline" />{repo.commitsCount ?? "—"} commits</span>
                        <span><GitPullRequest size={11} className="mr-1 inline" />{repo.pullRequestsCount ?? "—"} PRs</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{repo.description || "No description provided."}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span><Code2 size={11} className="mr-1 inline" />{repo.language || "Language not listed"}</span>
                      <span><CalendarDays size={11} className="mr-1 inline" />Updated {formatDate(repo.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : <p className="mt-3 text-xs text-slate-500">No public repositories found.</p>}
          {summary.publicRepos > (summary.repositories?.length || 0) && (
            <a href={`${summary.profileUrl}?tab=repositories`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
              More details on GitHub <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-slate-500"><Icon size={12} />{label}</div>
      <div className="mt-1 truncate text-xs font-semibold text-slate-800">{value ?? "—"}</div>
    </div>
  );
}
