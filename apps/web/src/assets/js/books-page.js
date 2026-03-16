import { requestJson } from "./api-client.js";

const filterBar = document.getElementById("books-filter");
const grid = document.getElementById("books-grid");
const status = document.getElementById("books-status");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBookCard(project) {
  const title = escapeHtml(project.title || "Untitled");
  const author = escapeHtml(project.author || "St. Expedite Press");
  const series = escapeHtml(project.series_title || "Program");
  const description = escapeHtml(project.popup_description || project.notes || "Catalog record");
  const completionPercent = Number.isFinite(Number(project.completion_percent))
    ? Math.max(0, Math.min(100, Math.round(Number(project.completion_percent))))
    : 0;
  const cover = completionPercent === 100 ? String(project.cover_image || "").trim() : "";
  const buyUrl = String(project.buy_url || "").trim()
    || (project.project_slug === "les-fievres-et-les-humeurs" ? "https://www.amazon.com/dp/B0GQG71JT9" : "");
  const stageLabel = completionPercent === 100
    ? "Complete"
    : completionPercent > 0
      ? "In progress"
      : "Queued";
  return `
    <article class="card book-card" data-series="${escapeHtml(project.series_key || "all")}">
      <div class="book-cover">
        ${cover
          ? `<img src="${escapeHtml(cover)}" alt="Cover art for ${title}" loading="lazy" decoding="async" />`
          : `<div class="book-cover-placeholder" aria-hidden="true"><span>${completionPercent}%</span><small>${escapeHtml(stageLabel)}</small></div>`}
      </div>
      <div class="book-body">
        <div class="book-series">${series}</div>
        <h3 class="book-title">${title}</h3>
        <div class="book-author">${author}</div>
        <div class="book-meta">${escapeHtml(project.status || "planned")} ${project.publication_year ? `// ${escapeHtml(project.publication_year)}` : ""}</div>
        <div class="book-progress" aria-label="${completionPercent}% complete">
          <div class="book-progress__meta">
            <span>${completionPercent}% complete</span>
            <span>${escapeHtml(stageLabel)}</span>
          </div>
          <div class="book-progress__track" aria-hidden="true">
            <span class="book-progress__fill" style="width:${completionPercent}%"></span>
          </div>
        </div>
        <p class="book-description">${description}</p>
        <div class="actions">
          ${buyUrl ? `<a class="button" href="${escapeHtml(buyUrl)}" target="_blank" rel="noopener noreferrer">Buy</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function applyFilter(seriesKey) {
  if (!grid) return;
  grid.querySelectorAll("[data-series]").forEach((card) => {
    const match = seriesKey === "all" || card.getAttribute("data-series") === seriesKey;
    card.hidden = !match;
  });
  filterBar?.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.series === seriesKey);
  });
}

async function init() {
  if (!grid || !status) return;
  status.textContent = "Loading catalog...";
  try {
    const data = await requestJson("/api/projects", { cache: "no-store" });
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const series = Array.isArray(data.series) ? data.series : [];
    grid.innerHTML = projects.map(renderBookCard).join("");
    status.textContent = `Loaded ${projects.length} catalog entries.`;

    if (filterBar) {
      const buttons = [
        `<button class="filter-button is-active" type="button" data-series="all">All</button>`,
        ...series.map((item) => `<button class="filter-button" type="button" data-series="${escapeHtml(item.key)}">${escapeHtml(item.title)}</button>`),
      ];
      filterBar.innerHTML = buttons.join("");
      filterBar.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => applyFilter(button.dataset.series || "all"));
      });
    }
  } catch (error) {
    status.textContent = "Catalog data is unavailable right now. Please try again later.";
    grid.innerHTML = `<div class="card"><p class="section-copy">The books catalog could not be loaded from the current program database.</p></div>`;
  }
}

init();
