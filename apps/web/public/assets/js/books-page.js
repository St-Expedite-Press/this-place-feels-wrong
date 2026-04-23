import { requestJson } from "./api-client.js";

const filterBar = document.getElementById("books-filter");
const list = document.getElementById("books-list");
const statusEl = document.getElementById("books-status");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const STATUS_META = {
  concept:     { label: "Concept",     cls: "status--concept" },
  planned:     { label: "Planned",     cls: "status--planned" },
  in_progress: { label: "In Progress", cls: "status--in-progress" },
  forthcoming: { label: "Forthcoming", cls: "status--forthcoming" },
  published:   { label: "Published",   cls: "status--published" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function renderBookRow(project) {
  const title = escapeHtml(project.title || "Untitled");
  const author = escapeHtml(project.author || "St. Expedite Press");
  const series = escapeHtml(project.series_title || "");
  const description = escapeHtml(project.popup_description || project.notes || "");
  const cover = String(project.cover_image || "").trim();
  const buyUrl = String(project.buy_url || "").trim();
  const statusKey = String(project.status || "planned");
  const meta = STATUS_META[statusKey] || STATUS_META.planned;
  const dateStr = formatDate(project.published_at);

  return `
    <article class="book-row" data-series="${escapeHtml(project.series_key || "all")}">
      <div class="book-row__cover" aria-hidden="true">
        ${cover
          ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async" />`
          : `<div class="book-row__cover-placeholder"></div>`}
      </div>
      <div class="book-row__body">
        ${series ? `<div class="book-row__series">${series}</div>` : ""}
        <h3 class="book-row__title">${title}</h3>
        <div class="book-row__author">${author}</div>
        ${description ? `<p class="book-row__description">${description}</p>` : ""}
      </div>
      <div class="book-row__aside">
        <span class="book-status ${escapeHtml(meta.cls)}">${escapeHtml(meta.label)}</span>
        ${dateStr ? `<span class="book-row__date">${escapeHtml(dateStr)}</span>` : ""}
        ${buyUrl ? `<a class="button book-row__buy" href="${escapeHtml(buyUrl)}" target="_blank" rel="noopener noreferrer">Buy</a>` : ""}
      </div>
    </article>
  `;
}

function applyFilter(seriesKey) {
  if (!list) return;
  list.querySelectorAll("[data-series]").forEach((row) => {
    const match = seriesKey === "all" || row.getAttribute("data-series") === seriesKey;
    row.hidden = !match;
  });
  filterBar?.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.series === seriesKey);
  });
}

async function init() {
  if (!list || !statusEl) return;
  try {
    const data = await requestJson("/api/projects", { cache: "no-store" });
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const series = Array.isArray(data.series) ? data.series : [];

    list.innerHTML = projects.map(renderBookRow).join("");
    statusEl.hidden = true;

    if (filterBar && series.length > 1) {
      const buttons = [
        `<button class="filter-tab is-active" type="button" data-series="all">All</button>`,
        ...series.map((item) =>
          `<button class="filter-tab" type="button" data-series="${escapeHtml(item.key)}">${escapeHtml(item.title)}</button>`
        ),
      ];
      filterBar.innerHTML = buttons.join("");
      filterBar.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => applyFilter(btn.dataset.series || "all"));
      });
    }
  } catch {
    statusEl.textContent = "Catalog unavailable.";
    list.innerHTML = "";
  }
}

init();
