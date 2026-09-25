import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Today's Focus" },
      {
        name: "description",
        content:
          "A calm frosted-glass to-do list. Add tasks, check them off, tear them away.",
      },
      { property: "og:title", content: "Lumen — Today's Focus" },
      {
        property: "og:description",
        content:
          "A calm frosted-glass to-do list. Add tasks, check them off, tear them away.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = "lumen-tasks";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Task =>
        t &&
        typeof t.id === "string" &&
        typeof t.text === "string" &&
        typeof t.done === "boolean"
    );
  } catch {
    return [];
  }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setDateLabel(
      new Date().toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // storage unavailable — tasks stay in memory for this session
    }
  }, [tasks, hydrated]);

  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.length - open;

  function addTask() {
    const text = draft.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setDraft("");
    inputRef.current?.focus();
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ambient gradient light */}
      <div
        aria-hidden
        className="absolute -top-40 -left-32 size-[520px] rounded-full bg-primary/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute top-1/3 -right-24 size-[460px] rounded-full bg-accent/30 blur-[130px]"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-glow/20 blur-[130px]"
      />

      <div className="relative mx-auto max-w-2xl px-5 py-14">
        {/* header */}
        <header className="mb-8 flex items-end justify-between animate-rise">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-accent shadow-[0_0_16px_2px] shadow-accent/70" />
              <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground/60">
                Lumen
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Today's Focus
            </h1>
            <p className="mt-1 text-sm text-foreground/45">
              {dateLabel || "\u00A0"}
              {tasks.length > 0 &&
                ` · ${open} ${open === 1 ? "task" : "tasks"} remaining`}
            </p>
          </div>
          <div className="glass-soft rounded-2xl px-4 py-3 text-right">
            <p className="font-display text-2xl font-bold text-accent">
              {open}
            </p>
            <p className="text-[11px] uppercase tracking-widest text-foreground/40">
              open
            </p>
          </div>
        </header>

        {/* add task */}
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl p-2 animate-rise">
          <span className="pl-3 font-display text-xl leading-none text-accent">
            +
          </span>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            placeholder="Add a new task…"
            className="flex-1 bg-transparent py-3 text-sm text-foreground/90 placeholder:text-foreground/35 focus:outline-none"
            aria-label="New task"
          />
          <button
            onClick={addTask}
            className="rounded-xl bg-primary px-5 py-3 font-display text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px] shadow-primary/60 transition-colors hover:bg-primary/90"
          >
            Add
          </button>
        </div>

        {/* task list */}
        {tasks.length === 0 ? (
          <div className="glass-soft rounded-2xl px-6 py-14 text-center animate-rise">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground/70">
              Nothing here yet.
            </p>
            <p className="mt-2 text-sm text-foreground/40">
              Add your first task above and give the day a shape.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task, i) => (
              <li
                key={task.id}
                className={`${
                  task.done ? "glass-soft" : "glass"
                } flex items-center gap-4 rounded-2xl p-4 animate-rise`}
                style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={
                    task.done
                      ? `Mark "${task.text}" as not done`
                      : `Mark "${task.text}" as done`
                  }
                  aria-pressed={task.done}
                  className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    task.done
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-accent/70 hover:bg-accent/20"
                  }`}
                >
                  {task.done && (
                    <span className="text-xs font-bold leading-none">✓</span>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium transition-colors ${
                      task.done
                        ? "text-foreground/40 line-through"
                        : "text-foreground/90"
                    }`}
                  >
                    {task.text}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/40">
                    {task.done ? "done" : `added ${formatTime(task.createdAt)}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete "${task.text}"`}
                  className="rounded-lg px-2 py-1 text-lg leading-none text-foreground/25 transition-colors select-none hover:text-destructive"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-xs text-foreground/30">
          Lumen — a calm place to think
          {done > 0 && ` · ${done} done today`}
        </p>
      </div>
    </div>
  );
}
