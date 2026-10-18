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
      className="mx-auto my-16 w-[90%] rounded-lg border border-[#e9eae4] bg-white p-5 sm:p-8"
    >
      <h2 id="improvement-title" className=" text-2xl tracking-tight">
        Improvements
      </h2>
      <p className="mt-2 text-sm text-[#777a73]">
        Have an idea? Add it below. Visitors and the team can both contribute.
      </p>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={addPlan}>
        <label className="sr-only" htmlFor="improvement-title-input">Improvement idea</label>
        <input
          id="improvement-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Suggest an improvement"
          maxLength={120}
          required
          className="min-h-11 min-w-0 flex-1 rounded-md border border-[#e5e7df] bg-[#fbfcf9] px-3 text-sm text-[#30332c] placeholder:text-[#a7a99f] focus:border-[#a7cc46] focus:outline-none focus:ring-2 focus:ring-[#a7cc46]/25"
        />
        <button
          type="submit"
          className="button button-dark"
          disabled={submitting || !title.trim()}
        >
          {submitting ? "Adding..." : "Add improvement"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-[#a33a29]" role="alert">{error}</p>}
      <div className="mt-6 border-t border-[#eceee7]">
        {loading ? (
          <p className="py-4 text-sm text-[#85887f]" role="status">Loading improvements...</p>
        ) : plans.length ? (
          <ol className="divide-y divide-[#eceee7]">
            {plans.map((plan) => (
              <li key={plan._id} className="flex items-center gap-3 py-3">
                <span className="w-8 shrink-0 text-xs font-semibold text-[#85887f]">
                  #{plan.number}
                </span>
                <input
                  type="checkbox"
                  checked={plan.status === "Completed"}
                  disabled={busyIds.includes(plan._id)}
                  onChange={(event) => setCompleted(plan, event.target.checked)}
                  aria-label={`Mark "${plan.title}" ${plan.status === "Completed" ? "incomplete" : "complete"}`}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#71894b] disabled:cursor-wait"
                />
                <span className={`min-w-0 flex-1 text-sm text-[#454940] ${plan.status === "Completed" ? "text-[#999c94] line-through" : ""}`}>
                  {plan.title}
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[plan.status] || statusStyles.Proposed}`}>
                  {plan.status}
                </span>
                <button
                  type="button"
                  disabled={busyIds.includes(plan._id)}
                  onClick={() => deletePlan(plan)}
                  aria-label={`Delete "${plan.title}"`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#999c94] transition hover:bg-[#f8eeea] hover:text-[#a33a29] disabled:cursor-wait disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          !error && <p className="py-4 text-sm text-[#85887f]">No improvements yet. Be the first to add one.</p>
        )}
      </div>
    </section>
  );
}
