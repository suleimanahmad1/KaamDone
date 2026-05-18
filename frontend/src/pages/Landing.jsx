import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaHistory,
  FaImage,
  FaLock,
  FaPaperclip,
  FaSearch,
  FaTh,
  FaUserCircle,
} from "react-icons/fa";

const highlights = [
  {
    icon: FaClipboardList,
    title: "Tasks your way",
    text: "Create, edit, sort by due date or priority. Grid or list view. Overdue tasks stand out.",
    accent: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/25",
  },
  {
    icon: FaClock,
    title: "Due date & time",
    text: "Set both date and time for deadlines so nothing slips through.",
    accent: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/25",
  },
  {
    icon: FaPaperclip,
    title: "Attachments",
    text: "Attach images, PDFs, and Word docs. Open or download right from your task board.",
    accent: "from-sky-500 to-cyan-500",
    glow: "shadow-sky-500/25",
  },
  {
    icon: FaHistory,
    title: "Activity history",
    text: "See what changed and when—with friendly timestamps on every update.",
    accent: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
  },
  {
    icon: FaUserCircle,
    title: "Profile & photo",
    text: "Crop your avatar, update your details, and reset your password securely by email.",
    accent: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/25",
  },
  {
    icon: FaLock,
    title: "Private by account",
    text: "Your tasks stay yours. Secure sign-in—never mixed with other users.",
    accent: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/25",
  },
];

const previewTasks = [
  {
    title: "Client presentation",
    priority: "High",
    status: "In Progress",
    extra: "2 attachments",
    border: "border-l-red-500",
  },
  {
    title: "Quarterly review doc",
    priority: "Medium",
    status: "Pending",
    extra: "Due tomorrow 5 PM",
    border: "border-l-amber-500",
  },
  {
    title: "Invoice scan",
    priority: "Low",
    status: "Completed",
    extra: "PDF attached",
    border: "border-l-emerald-500",
  },
];

const priorityBadge = {
  High: "bg-red-50 text-red-700 ring-1 ring-red-200/80",
  Medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
  Low: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
};

const stats = [
  { value: "5", label: "files per task" },
  { value: "10 MB", label: "max file size" },
  { value: "100%", label: "your data" },
];

const heroPerks = [
  { icon: FaTh, label: "Grid & list views" },
  { icon: FaSearch, label: "Search & filters" },
  { icon: FaImage, label: "Crop your avatar" },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/35 ring-2 ring-white/50">
              K
            </span>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">KaamDone</span>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">Tasks · files · reminders</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-indigo-700 sm:px-4"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-700 hover:to-violet-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:pt-20">
        <section className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              Free to start · no credit card
            </p>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Get your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  kaam
                </span>
                <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-full bg-gradient-to-r from-indigo-200 to-violet-200" />
              </span>{" "}
              done.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              One calm dashboard for deadlines, file attachments you can open in a click, activity history, and a
              profile that feels personal.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-[1.02] hover:shadow-indigo-600/40 active:scale-[0.98]"
              >
                Create free account
                <FaArrowRight className="text-xs transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-2xl border border-slate-200/80 bg-white/90 px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md"
              >
                Sign in
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              {heroPerks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="text-sm" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 lg:pl-4">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-1 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-slate-500">KaamDone — Your board</span>
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                {previewTasks.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-xl border border-slate-100 border-l-4 bg-gradient-to-r from-white to-slate-50/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${item.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <FaPaperclip className="mt-1 shrink-0 text-indigo-400/80" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60">
                        {item.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{item.extra}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-20">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-md sm:gap-8 sm:p-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mt-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything in one place</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Built for clarity—so you spend less time organizing and more time finishing.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text, accent, glow }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200/80 hover:shadow-xl hover:shadow-indigo-100/50"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg ${glow} transition group-hover:scale-105`}
                >
                  <Icon className="text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative z-10 mt-24 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700" />
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16">
            <FaCheckCircle className="mx-auto text-3xl text-white/90" />
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Ready to clear your list?</h2>
            <p className="mx-auto mt-3 max-w-md text-indigo-100">
              Join KaamDone and manage tasks, files, and deadlines from one beautiful dashboard.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-xl transition hover:scale-[1.02] hover:bg-indigo-50 active:scale-[0.98]"
            >
              Start for free
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/50 py-10 text-center backdrop-blur-sm">
        <p className="text-base font-bold text-slate-800">KaamDone</p>
        <p className="mt-2 text-sm text-slate-500">Tasks done right.</p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Link to="/login" className="font-medium text-slate-600 hover:text-indigo-600">
            Login
          </Link>
          <span className="text-slate-300">·</span>
          <Link to="/register" className="font-medium text-slate-600 hover:text-indigo-600">
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}
