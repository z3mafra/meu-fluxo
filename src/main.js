import { readTasks, writeTasks } from "./storage.js";
import { createTask } from "./tasks.js";
import { renderApp } from "./render.js";

let tasks = readTasks();
let view = "today";
let areaFilter = "all";
let doneOpen = false;
let toastTimer;

const root = document.querySelector("#app");

function persist() {
  try {
    writeTasks(tasks);
    return true;
  } catch {
    notify("Não consegui salvar neste navegador.");
    return false;
  }
}

function notify(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function render() {
  root.innerHTML = renderApp({ tasks, view, areaFilter, doneOpen });
  bindEvents();
}

function openEditor(id) {
  const task = tasks.find((item) => item.id === id);
  const dialog = document.querySelector("#edit-dialog");
  if (!task || !dialog) return;
  const form = dialog.querySelector("#edit-form");
  form.elements.id.value = task.id;
  form.elements.title.value = task.title;
  form.elements.area.value = task.area || "";
  form.elements.status.value = task.status;
  form.elements.due.value = task.due || "";
  dialog.showModal();
  form.elements.title.focus();
}

function bindEvents() {
  root.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
    view = button.dataset.view;
    render();
  }));

  root.querySelector(".done-block")?.addEventListener("toggle", (event) => { doneOpen = event.currentTarget.open; });

  root.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    areaFilter = button.dataset.filter;
    render();
  }));

  root.querySelectorAll("[data-focus-capture]").forEach((button) => button.addEventListener("click", () => {
    document.querySelector("#new-title")?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));

  root.querySelector("#capture-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.title.value.trim();
    if (!title) return;
    tasks.unshift(createTask(title, form.elements.area.value));
    if (persist()) {
      render();
      notify("Tarefa adicionada à Entrada.");
    }
  });

  root.querySelector("#view-content")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const task = tasks.find((item) => item.id === action.closest("[data-id]")?.dataset.id);
    if (!task) return;
    if (action.dataset.action === "edit") openEditor(task.id);
    if (action.dataset.action === "toggle") {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : "";
      if (persist()) {
        render();
        notify(task.completed ? "Tarefa concluída." : "Tarefa reaberta.");
      }
    }
  });

  const dialog = root.querySelector("#edit-dialog");
  const editForm = root.querySelector("#edit-form");
  editForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const task = tasks.find((item) => item.id === form.elements.id.value);
    const title = form.elements.title.value.trim();
    if (!task || !title) return;
    task.title = title;
    task.area = form.elements.area.value;
    task.status = form.elements.status.value;
    task.due = form.elements.due.value;
    if (persist()) {
      dialog.close();
      render();
      notify("Alterações salvas.");
    }
  });

  root.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  root.querySelector("[data-delete-task]")?.addEventListener("click", () => {
    const id = editForm.elements.id.value;
    const target = tasks.find((item) => item.id === id);
    if (!window.confirm(`Excluir “${target?.title ?? "esta tarefa"}”?`)) return;
    tasks = tasks.filter((item) => item.id !== id);
    if (persist()) {
      dialog.close();
      render();
      notify("Tarefa excluída.");
    }
  });
}

render();
