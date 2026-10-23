import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createImprovementPlan,
  deleteImprovementPlan,
  getImprovementPlans,
  updateImprovementPlan,
} from "../../service/apiCall.js";

const statusStyles = {
  Proposed: "bg-[#eef2e7] text-[#64734e]",
  "Under review": "bg-[#f5f0df] text-[#8b713b]",
  Planned: "bg-[#e9eff5] text-[#5f7487]",
  "In progress": "bg-[#f6ebe1] text-[#a16d43]",
  Completed: "bg-[#e6f0e5] text-[#5f8058]",
};

export default function Improvement() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyIds, setBusyIds] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    getImprovementPlans({ signal: controller.signal })
      .then(setPlans)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const addPlan = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const plan = await createImprovementPlan(title);
      setPlans((current) => [plan, ...current]);
      setTitle("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setCompleted = async (plan, completed) => {
    setBusyIds((current) => [...current, plan._id]);
    setError("");

    try {
      const updatedPlan = await updateImprovementPlan(plan._id, completed);
      setPlans((current) =>
        current.map((item) => item._id === updatedPlan._id ? updatedPlan : item),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyIds((current) => current.filter((id) => id !== plan._id));
    }
  };

  const deletePlan = async (plan) => {
    setBusyIds((current) => [...current, plan._id]);
    setError("");

    try {
      await deleteImprovementPlan(plan._id);
      setPlans((current) => current.filter((item) => item._id !== plan._id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyIds((current) => current.filter((id) => id !== plan._id));
    }
  };

  return (
    <section
      aria-labelledby="improvement-title"
      className="section-container my-16 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="kicker-pill">
            <span>COMMUNITY ROADMAP</span>
          </div>
          <h2 id="improvement-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Platform Improvements
          </h2>
          <p className="mt-2 text-base text-slate-500 max-w-xl">
            Have an idea to make Northstar better? Share your feedback below. Both candidates and hiring teams can submit and track ideas.
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={addPlan}>
        <label className="sr-only" htmlFor="improvement-title-input">Improvement idea</label>
        <input
          id="improvement-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Suggest a new feature or improvement..."
          maxLength={120}
          required
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
        />
        <button
          type="submit"
          className="btn-primary-explore"
          disabled={submitting || !title.trim()}
        >
          {submitting ? "Adding..." : "Submit Idea"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-rose-600" role="alert">{error}</p>}

      <div className="mt-8 border-t border-slate-100 pt-4">
        {loading ? (
          <p className="py-6 text-sm text-slate-500" role="status">Loading feedback entries...</p>
        ) : plans.length ? (
          <ol className="divide-y divide-slate-100">
            {plans.map((plan) => (
              <li key={plan._id} className="flex items-center gap-3 py-3.5 transition hover:bg-slate-50/50 rounded-lg px-2">
                <span className="w-9 shrink-0 font-mono text-xs font-semibold text-slate-400">
                  #{plan.number}
                </span>
                <input
                  type="checkbox"
                  checked={plan.status === "Completed"}
                  disabled={busyIds.includes(plan._id)}
                  onChange={(event) => setCompleted(plan, event.target.checked)}
                  aria-label={`Mark "${plan.title}" ${plan.status === "Completed" ? "incomplete" : "complete"}`}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded accent-emerald-600 disabled:cursor-wait"
                />
                <span className={`min-w-0 flex-1 text-sm font-medium text-slate-800 ${plan.status === "Completed" ? "text-slate-400 line-through" : ""}`}>
                  {plan.title}
                </span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[plan.status] || statusStyles.Proposed}`}>
                  {plan.status}
                </span>
                <button
                  type="button"
                  disabled={busyIds.includes(plan._id)}
                  onClick={() => deletePlan(plan)}
                  aria-label={`Delete "${plan.title}"`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          !error && <p className="py-6 text-sm text-slate-500">No suggestions yet. Be the first to add an improvement!</p>
        )}
      </div>
    </section>
  );
}
