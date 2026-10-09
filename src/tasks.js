export const AREAS = {
  work: "Trabalho",
  home: "Casa",
  fun: "Lazer",
};

export const STATUSES = {
  inbox: "Entrada",
  today: "Hoje",
  upcoming: "Próximas",
  waiting: "Aguardando",
};

export function createTask(title, area = "") {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: title.trim(),
    area,
    status: "inbox",
    due: "",
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function todayISO(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function activeTasks(tasks) {
  return tasks.filter((task) => !task.completed);
}

export function completedTasks(tasks) {
  return tasks
    .filter((task) => task.completed)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
}

export function isOverdue(task, today = todayISO()) {
  return !task.completed && Boolean(task.due) && task.due < today;
}

// Tarefas com prazo vencido ou para hoje entram em "Hoje", exceto as que aguardam alguém.
function isDueToday(task, today) {
  return Boolean(task.due) && task.due <= today && task.status !== "waiting";
}

// Com prazo primeiro (mais próximo antes); sem prazo mantém a ordem original.
export function sortByDue(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });
}

export function tasksForView(tasks, view, areaFilter = "all") {
  const active = activeTasks(tasks);
  const today = todayISO();
  if (view === "today") return sortByDue(active.filter((task) => task.status === "today" || isDueToday(task, today)));
  if (view === "upcoming") return sortByDue(active.filter((task) => task.status === "upcoming" && !isDueToday(task, today)));
  if (view === "inbox") return active.filter((task) => task.status === "inbox");
  return active.filter((task) => areaFilter === "all" || task.area === areaFilter);
}
