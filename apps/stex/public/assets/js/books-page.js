import { requestJson } from "./api-client.js";
import { escapeHtml } from "./form-utils.js";

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

function safeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function renderBookRow(project) {
  const title = escapeHtml(project.title || "Untitled");
  const author = escapeHtml(project.author || "St. Expedite Press");
  const description = escapeHtml(project.popup_description || "");
  const cover = String(project.cover_image || "").trim();
  const buyUrl = safeExternalUrl(project.buy_url);
  const meta = STATUS_META[String(project.status || "planned")] || STATUS_META.planned;
  const dateStr = formatDate(project.published_at);

  return `
    <article class="book-row">
      <div class="book-row__cover" aria-hidden="true">
        ${cover
          ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async" />`
          : `<div class="book-row__cover-placeholder"></div>`}
      </div>
      <div class="book-row__body">
        <h4 class="book-row__title">${title}</h4>
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

// --- Sliding-deck carousel -------------------------------------------------
function initCarousel() {
  const track = document.getElementById("series-track");
  const viewport = document.getElementById("series-viewport");
  const dotsWrap = document.getElementById("series-dots");
  const cards = track ? Array.from(track.querySelectorAll(".series-card")) : [];
  if (!track || !viewport || !dotsWrap || cards.length === 0) return;

  const prevBtn = document.querySelector("[data-carousel-prev]");
  const nextBtn = document.querySelector("[data-carousel-next]");
  let index = 0;

  const dots = cards.map((card, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Series ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(next) {
    index = Math.max(0, Math.min(cards.length - 1, next));
    track.style.transform = `translateX(${index * -100}%)`;
    dots.forEach((d, i) => d.setAttribute("aria-selected", i === index ? "true" : "false"));
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;
  }

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
  });

  // Pointer drag / swipe
  let startX = 0;
  let dragging = false;
  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    track.style.transition = "none";
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(calc(${index * -100}% + ${dx}px))`;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = "";
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) goTo(index + (dx < 0 ? 1 : -1));
    else goTo(index);
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);

  goTo(0);
  return cards;
}

// --- Populate each series card with its live titles ------------------------
function matchesCard(project, tokens) {
  const hay = `${project.series_key || ""} ${project.series_title || ""}`.toLowerCase();
  return tokens.some((t) => t && hay.includes(t));
}

async function loadTitles(cards) {
  if (!cards || cards.length === 0) return;

  let projects = null;
  try {
    const data = await requestJson("/api/projects", { cache: "no-store" });
    projects = Array.isArray(data.projects) ? data.projects : [];
  } catch (err) {
    console.error("books catalog unavailable", err);
  }

  cards.forEach((card) => {
    const box = card.querySelector("[data-series-titles]");
    const status = card.querySelector("[data-series-status]");
    if (!box) return;

    if (projects === null) {
      if (status) status.textContent = "Catalog unavailable — titles load when the shop is reachable.";
      return;
    }

    const tokens = String(card.getAttribute("data-series-match") || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const matched = projects.filter((p) => matchesCard(p, tokens));

    if (matched.length === 0) {
      box.innerHTML = `<p class="helper-text">Titles in preparation.</p>`;
      return;
    }
    box.innerHTML = matched.map(renderBookRow).join("");
  });
}

function init() {
  const cards = initCarousel();
  loadTitles(cards);
}

document.addEventListener("astro:page-load", init);
