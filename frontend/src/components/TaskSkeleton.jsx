export default function TaskSkeleton() {
  return (
    <article className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex justify-between gap-3">
        <span className="block h-5 w-2/3 rounded bg-slate-200" />
        <span className="block h-8 w-16 rounded bg-slate-200" />
      </div>
      <span className="mb-4 block h-4 w-full rounded bg-slate-100" />
      <span className="mb-4 block h-4 w-4/5 rounded bg-slate-100" />
      <div className="mb-4 flex gap-2">
        <span className="block h-6 w-16 rounded-full bg-slate-200" />
        <span className="block h-6 w-24 rounded-full bg-slate-200" />
      </div>
      <span className="block h-4 w-32 rounded bg-slate-100" />
    </article>
  );
}
