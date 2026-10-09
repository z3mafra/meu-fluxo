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

export function activeTasks(tasks) {
  return tasks.filter((task) => !task.completed);
}

export function tasksForView(tasks, view, areaFilter = "all") {
  const active = activeTasks(tasks);
  if (view === "today") return active.filter((task) => task.status === "today");
  if (view === "inbox") return active.filter((task) => task.status === "inbox");
  return active.filter((task) => areaFilter === "all" || task.area === areaFilter);
}
