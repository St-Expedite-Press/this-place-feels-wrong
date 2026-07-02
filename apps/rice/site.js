const UPDATES_ENDPOINT = "https://stexpedite.press/api/updates";
const UPDATES_SOURCE = "rice-magazine-seed";

let searchIndex = [
  { type: "Page", title: "A Year of RICE", author: "St. Expedite Press", href: "year.html", meta: "Four volumes / sixteen towns" },
  { type: "Page", title: "The Seed Object", author: "St. Expedite Press", href: "shop.html", meta: "Prelaunch" },
  { type: "Page", title: "Submissions", author: "RICE Editors", href: "submissions.html", meta: "Closed during prelaunch" }
];
let renderSearch = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const WORKS_ENDPOINT = "https://stexpedite.press/api/works?program=rice";

function mergeWorks(works) {
  if (!works.length) return false;
  searchIndex = [...works, ...searchIndex];
  if (renderSearch) renderSearch();
  return true;
}

async function loadSearchIndex() {
  // Primary source: the unified works API (D1). RICE and the St. Expedite
  // catalog now share one model; RICE reads its works at runtime.
  try {
    const response = await fetch(WORKS_ENDPOINT);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    const works = (data.works || [])
      .filter(work => ["sample", "published"].includes(work.status) && work.href)
      .map(work => {
        const ref = typeof work.notes === "string" && work.notes.startsWith("ref: ")
          ? work.notes.slice(5)
          : null;
        return {
          type: work.status === "sample" ? "Editorial sample" : (work.kind || "Work"),
          title: work.title,
          author: work.author || "RICE",
          href: work.href,
          meta: [work.series_key, work.place, ref].filter(Boolean).join(" / ")
        };
      });
    if (mergeWorks(works)) return;
  } catch {
    // fall back to the static manifest below
  }

  // Fallback: static articles.json (keeps search working if the API is down).
  try {
    const response = await fetch("assets/articles.json");
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    const works = data.articles
      .filter(work => ["sample", "published"].includes(work.publication_state) && work.href)
      .map(work => ({
        type: work.is_sample ? "Editorial sample" : work.category,
        title: work.title,
        author: work.author || "RICE",
        href: work.href,
        meta: [work.season, work.place, work.ref].filter(Boolean).join(" / ")
      }));
    mergeWorks(works);
  } catch {
    // Utility pages remain available when neither source loads.
  }
}

function buildUtilities() {
  const masthead = document.querySelector(".masthead");
  if (!masthead || masthead.querySelector(".masthead-tools")) return;

  const tools = document.createElement("div");
  tools.className = "masthead-tools";
  tools.innerHTML = `
    <a href="index.html" class="button" aria-label="Current issue: RICE 1 Seed">RICE 1 / SEED</a>
    <button class="search-trigger" type="button" aria-haspopup="dialog">Search /</button>
  `;
  masthead.append(tools);

  const dialog = document.createElement("dialog");
  dialog.className = "search-dialog";
  dialog.innerHTML = `
    <form method="dialog" class="search-shell">
      <div class="search-heading">
        <label for="site-search">Search the field</label>
        <button value="cancel" aria-label="Close search">Close ×</button>
      </div>
      <input id="site-search" type="search" autocomplete="off" placeholder="TITLE / AUTHOR / PLACE">
      <div class="search-results" aria-live="polite"></div>
    </form>
  `;
  document.body.append(dialog);

  const input = dialog.querySelector("input");
  const results = dialog.querySelector(".search-results");
  const render = value => {
    const query = value.trim().toLowerCase();
    const matches = searchIndex.filter(item => !query || Object.values(item).join(" ").toLowerCase().includes(query));
    results.innerHTML = matches.length
      ? matches.map(item => `
          <a href="${escapeHtml(item.href)}" class="search-result">
            <span>${escapeHtml(item.type)}</span>
            <span><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.author)} / ${escapeHtml(item.meta)}</small></span>
          </a>`).join("")
      : `<p class="field-label">No available records found / try another term</p>`;
  };
  render("");
  renderSearch = () => render(input.value);
  input.addEventListener("input", event => render(event.target.value));
  tools.querySelector(".search-trigger").addEventListener("click", () => {
    dialog.showModal();
    input.focus();
  });
}

function enableReadingMode() {
  document.querySelectorAll("[data-reading-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const active = document.body.classList.toggle("reading-mode");
      button.textContent = active ? "Exit reading mode" : "Reading mode";
      button.setAttribute("aria-pressed", String(active));
      button.focus();
    });
  });
}

function enableFilters(filterAttribute, itemAttribute, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const buttons = [...document.querySelectorAll(`[${filterAttribute}]`)];
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute(filterAttribute);
      buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      container.querySelectorAll(`[${itemAttribute}]`).forEach(item => {
        item.hidden = filter !== "all" && item.getAttribute(itemAttribute) !== filter;
      });
    });
  });
}

function statusMessage(status, body) {
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status >= 500) return "The updates service is unavailable. Your address was not saved.";
  return body?.error || "The address could not be saved. Check it and try again.";
}

function renderUpdatesForms() {
  document.querySelectorAll("[data-updates-form]").forEach((mount, index) => {
    const id = `updates-email-${index + 1}`;
    mount.innerHTML = `
      <form class="updates-form" novalidate>
        <label for="${id}">Email for RICE production and issue notices</label>
        <div class="updates-form-row">
          <input id="${id}" name="email" type="email" inputmode="email" autocomplete="email" required maxlength="320">
          <input class="visually-hidden" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button type="submit">Join updates</button>
        </div>
        <p class="form-status" aria-live="polite"></p>
        <p class="form-note">Stored by St. Expedite Press for RICE production notices. No sale of addresses. Every message includes an unsubscribe route.</p>
      </form>
    `;

    const form = mount.querySelector("form");
    const email = form.elements.email;
    const button = form.querySelector("button");
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", async event => {
      event.preventDefault();
      status.textContent = "";
      if (!email.checkValidity()) {
        email.reportValidity();
        status.textContent = "Enter a valid email address.";
        return;
      }

      button.disabled = true;
      button.textContent = "Saving…";
      form.setAttribute("aria-busy", "true");
      try {
        const response = await fetch(UPDATES_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: email.value.trim(),
            source: UPDATES_SOURCE,
            website: form.elements.website.value
          })
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw Object.assign(new Error("request failed"), { response, body });
        status.textContent = body.alreadySignedUp
          ? "You are already on the RICE updates list."
          : "Address saved. We will write when there is real news.";
        form.reset();
      } catch (error) {
        if (!navigator.onLine) {
          status.textContent = "You appear to be offline. Your address was not saved.";
        } else if (error.response) {
          status.textContent = statusMessage(error.response.status, error.body);
        } else {
          status.textContent = "The updates service could not be reached. Your address was not saved.";
        }
      } finally {
        button.disabled = false;
        button.textContent = "Join updates";
        form.removeAttribute("aria-busy");
      }
    });
  });
}

buildUtilities();
loadSearchIndex();
enableReadingMode();
enableFilters("data-issue-filter", "data-issue-tag", "[data-issue-index]");
enableFilters("data-archive-filter", "data-archive-tag", "[data-archive-index]");
renderUpdatesForms();
