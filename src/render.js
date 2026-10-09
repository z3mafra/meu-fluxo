import { AREAS, STATUSES, activeTasks, completedTasks, isOverdue, sortByDue, tasksForView } from "./tasks.js";

const icons = {
  today: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M3.5 6l1 1L6 5M3.5 12l1 1L6 11M3.5 18l1 1L6 17"/></svg>',
  upcoming: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 14h4l1.5 2h5L16 14h4"/></svg>',
  check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg>',
};

const pageCopy = {
  today: ["Hoje", "Seu dia, no seu ritmo", "Escolha o que cabe no dia. O restante pode esperar."],
  upcoming: ["Próximas", "O que vem pela frente", "Tarefas planejadas para depois de hoje."],
  tasks: ["Tarefas", "Tudo o que você anotou", "Filtre por área e encontre o próximo passo."],
  inbox: ["Entrada", "Um lugar para começar", "Organize estas tarefas quando tiver um momento."],
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function dateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function taskRow(task, showOrganize = false) {
  const area = task.area ? `<span class="chip area-${task.area}">${AREAS[task.area]}</span>` : "";
  const late = isOverdue(task);
  const due = task.due ? `<span class="due ${late ? "overdue" : ""}">${late ? "Atrasada · " : ""}Prazo ${dateLabel(task.due)}</span>` : "";
  const organize = showOrganize ? '<button class="small-button" data-action="edit">Organizar</button>' : "";
  return `<article class="task-row ${task.completed ? "is-complete" : ""}" data-id="${escapeHTML(task.id)}">
    <button class="check-button ${task.completed ? "is-checked" : ""}" data-action="toggle" aria-label="${task.completed ? "Reabrir" : "Concluir"} tarefa">${task.completed ? icons.check : ""}</button>
    <div class="task-copy"><div class="task-title">${escapeHTML(task.title)}</div><div class="task-meta">${area}${due}</div></div>
    <div class="task-actions">${organize}<button class="icon-button" data-action="edit" aria-label="Editar tarefa">${icons.edit}</button></div>
  </article>`;
}

function emptyState(title, text) {
  return `<div class="empty-state"><div class="empty-check">${icons.check}</div><strong>${title}</strong><p>${text}</p></div>`;
}

function block(title, tasks, organize = false) {
  if (!tasks.length) return "";
  return `<section class="task-block"><h2>${title}<span>${tasks.length}</span></h2><div class="task-list">${tasks.map((task) => taskRow(task, organize)).join("")}</div></section>`;
}

function filters(activeFilter) {
  const choices = [["all", "Todas"], ["work", "Trabalho"], ["home", "Casa"], ["fun", "Lazer"]];
  return `<div class="filters" role="group" aria-label="Filtrar por área">${choices.map(([key, label]) => `<button class="filter-button ${key === activeFilter ? "selected" : ""}" data-filter="${key}">${label}</button>`).join("")}</div>`;
}

function taskContent(tasks, view, areaFilter, doneOpen) {
  if (view === "inbox") {
    const list = tasksForView(tasks, view);
    return list.length ? block("Para organizar", list, true) : emptyState("Sua Entrada está vazia.", "Novas tarefas aparecem aqui. Você pode registrar uma acima e organizá-la depois.");
  }
  if (view === "upcoming") {
    const list = tasksForView(tasks, view);
    return list.length ? block("Planejadas", list) : emptyState("Nada planejado por enquanto.", "Use “Organizar” numa tarefa e escolha “Próximas” para vê-la aqui.");
  }
  if (view === "today") {
    const today = tasksForView(tasks, view);
    const waiting = sortByDue(activeTasks(tasks).filter((task) => task.status === "waiting"));
    return `${today.length ? block("Para hoje", today) : emptyState("Seu dia está livre por enquanto.", "Adicione uma tarefa acima e escolha “Hoje” quando quiser colocá-la no seu dia.")}${block("Aguardando", waiting)}`;
  }
  const list = tasksForView(tasks, "tasks", areaFilter);
  const grouped = Object.keys({ today: true, upcoming: true, waiting: true, inbox: true })
    .map((status) => [status, list.filter((task) => task.status === status)]);
  const content = grouped.map(([status, group]) => block(STATUSES[status], sortByDue(group), status === "inbox")).join("");
  const done = completedTasks(tasks).filter((task) => areaFilter === "all" || task.area === areaFilter);
  const doneBlock = done.length
    ? `<details class="done-block" ${doneOpen ? "open" : ""}><summary>Concluídas<span>${done.length}</span></summary><div class="task-list">${done.map((task) => taskRow(task)).join("")}</div></details>`
    : "";
  return `${filters(areaFilter)}${content || (done.length ? "" : emptyState("Nenhuma tarefa por aqui.", "Adicione uma acima e ela aparecerá nesta lista."))}${doneBlock}`;
}

function taskCounts(tasks) {
  return {
    today: tasksForView(tasks, "today").length,
    inbox: tasks.filter((task) => task.status === "inbox" && !task.completed).length,
  };
}

export function renderApp({ tasks, view, areaFilter, doneOpen = false }) {
  const [title, kicker, intro] = pageCopy[view];
  const counts = taskCounts(tasks);
  const date = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const nav = (isMobile = false) => `<nav class="${isMobile ? "mobile-nav" : "side-nav"}" aria-label="Navegação principal">
    <button data-view="today" class="${view === "today" ? "active" : ""}">${icons.today}<span>Hoje</span>${counts.today ? `<b>${counts.today}</b>` : ""}</button>
    <button data-view="upcoming" class="${view === "upcoming" ? "active" : ""}">${icons.upcoming}<span>Próximas</span></button>
    <button data-view="tasks" class="${view === "tasks" ? "active" : ""}">${icons.tasks}<span>Tarefas</span></button>
    ${isMobile ? '<button class="mobile-add" data-focus-capture aria-label="Nova tarefa">＋</button>' : ""}
    <button data-view="inbox" class="${view === "inbox" ? "active" : ""}">${icons.inbox}<span>Entrada</span>${counts.inbox ? `<b>${counts.inbox}</b>` : ""}</button>
  </nav>`;

  return `<div class="app-shell">
    <aside class="sidebar"><a class="brand" href="#" aria-label="Meu Fluxo, início"><span class="brand-mark">${icons.check}</span>meu fluxo</a>
      <div class="nav-label">Organizar</div>${nav()}
      <div class="sidebar-note"><strong>Um passo de cada vez.</strong>Os dados ficam salvos neste navegador.</div>
    </aside>
    <main class="main-content"><header class="topline"><span class="eyebrow">${kicker}</span><time>${date}</time></header>
      <h1>${title}</h1><p class="intro">${intro}</p>
      <form class="capture-form" id="capture-form"><input id="new-title" name="title" maxlength="140" placeholder="O que precisa ser feito?" aria-label="Nova tarefa" required>
        <select id="new-area" name="area" aria-label="Área da tarefa"><option value="">Escolher área</option><option value="work">Trabalho</option><option value="home">Casa</option><option value="fun">Lazer</option></select>
        <button type="submit">Adicionar</button></form>
      <section class="content" id="view-content" aria-live="polite">${taskContent(tasks, view, areaFilter, doneOpen)}</section>
    </main>${nav(true)}
    <dialog class="edit-dialog" id="edit-dialog"><form id="edit-form" method="dialog">
      <div class="dialog-head"><h2>Organizar tarefa</h2><button type="button" class="close-button" data-close-dialog aria-label="Fechar">×</button></div>
      <input type="hidden" name="id">
      <label>Tarefa<input name="title" maxlength="140" required></label>
      <label>Área<select name="area"><option value="">Sem área</option><option value="work">Trabalho</option><option value="home">Casa</option><option value="fun">Lazer</option></select></label>
      <label>Onde fica?<select name="status"><option value="inbox">Entrada — organizar depois</option><option value="today">Hoje</option><option value="upcoming">Próximas</option><option value="waiting">Aguardando alguém</option></select></label>
      <label>Prazo (opcional)<input name="due" type="date"></label>
      <footer><button class="delete-button" type="button" data-delete-task>Excluir tarefa</button><div><button class="cancel-button" type="button" data-close-dialog>Cancelar</button><button class="save-button" type="submit">Salvar</button></div></footer>
    </form></dialog><div class="toast" id="toast" role="status"></div>
  </div>`;
}
