const STORAGE_KEY = "meu-fluxo.tasks.v1";

export function readTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
