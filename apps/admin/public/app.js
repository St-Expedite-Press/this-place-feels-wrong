(() => {
  const apiBase = document.querySelector('meta[name="api-base"]')?.content || "";

  const loginSection = document.querySelector("[data-login]");
  const loginForm = document.querySelector("[data-login-form]");
  const emailInput = document.querySelector("[data-email-input]");
  const loginNotice = document.querySelector("[data-login-notice]");
  const dashboard = document.querySelector("[data-dashboard]");
  const logoutButton = document.querySelector("[data-logout]");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  const PANELS = {
    signups: {
      render: (rows) => rows.map((r) => `<tr>
        <td>${escapeHtml(r.email)}</td>
        <td>${formatDate(r.first_seen_at)}</td>
        <td>${escapeHtml(r.source || "—")}</td>
        <td>${r.unsubscribed_at ? formatDate(r.unsubscribed_at) : "—"}</td>
      </tr>`).join(""),
      colspan: 4,
    },
    submissions: {
      render: (rows) => rows.map((r) => `<tr>
        <td>${escapeHtml(r.type)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.author_name || "—")}</td>
        <td>${escapeHtml(r.work_title || "—")}</td>
        <td>${formatDate(r.received_at)}</td>
      </tr>`).join(""),
      colspan: 5,
    },
    donations: {
      render: (rows) => rows.map((r) => `<tr>
        <td>${typeof r.amount_cents === "number" ? `$${(r.amount_cents / 100).toFixed(2)}` : "—"}</td>
        <td>${escapeHtml(r.email || "—")}</td>
        <td>${escapeHtml(r.payment_status || "—")}</td>
        <td>${formatDate(r.received_at)}</td>
      </tr>`).join(""),
      colspan: 4,
    },
  };

  async function loadPanel(name) {
    const panelEl = document.querySelector(`[data-panel="${name}"]`);
    if (!panelEl) return;
    const tbody = panelEl.querySelector("[data-rows]");
    const countEl = panelEl.querySelector("[data-count]");
    const config = PANELS[name];

    try {
      const res = await fetch(`${apiBase}/api/admin/${name}?limit=50`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows = Array.isArray(data.rows) ? data.rows : [];
      countEl.textContent = `(${rows.length})`;
      tbody.innerHTML = rows.length
        ? config.render(rows)
        : `<tr class="empty-row"><td colspan="${config.colspan}">No rows yet.</td></tr>`;
    } catch (error) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="${config.colspan}">Failed to load — ${escapeHtml(error.message)}</td></tr>`;
    }
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboard.hidden = false;
    logoutButton.hidden = false;
    for (const name of Object.keys(PANELS)) loadPanel(name);
    loadPresetQueue();
    loadModels();
  }

  async function loadPresetQueue() {
    const tbody = document.querySelector("[data-presets-rows]");
    const countEl = document.querySelector("[data-presets-count]");
    const detailBox = document.querySelector("[data-preset-detail]");
    if (!tbody) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/presets/pending`, { credentials: "include" });
      const rows = (await res.json()).rows || [];
      countEl.textContent = `(${rows.length})`;
      tbody.innerHTML = rows.length ? rows.map((r) => `<tr data-id="${escapeHtml(r.id)}">
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.creator_email || "—")}</td>
        <td><button data-detail="${escapeHtml(r.id)}">view</button></td>
        <td><button data-approve="${escapeHtml(r.id)}">approve</button> <button data-reject="${escapeHtml(r.id)}">reject</button></td>
      </tr>`).join("") : `<tr class="empty-row"><td colspan="4">Nothing awaiting review.</td></tr>`;
      tbody.querySelectorAll("[data-approve]").forEach((b) => b.addEventListener("click", () => moderate(b.dataset.approve, "approve")));
      tbody.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => moderate(b.dataset.reject, "reject")));
      tbody.querySelectorAll("[data-detail]").forEach((b) => b.addEventListener("click", async () => {
        const res2 = await fetch(`${apiBase}/api/admin/presets/${b.dataset.detail}/detail`, { credentials: "include" });
        detailBox.hidden = false;
        detailBox.textContent = JSON.stringify(await res2.json(), null, 2);
      }));
    } catch { tbody.innerHTML = `<tr class="empty-row"><td colspan="4">Failed to load.</td></tr>`; }
  }

  async function moderate(id, action) {
    await fetch(`${apiBase}/api/admin/presets/${id}/moderate`, {
      method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    }).catch(() => {});
    loadPresetQueue();
  }

  async function loadModels() {
    const tbody = document.querySelector("[data-models-rows]");
    if (!tbody) return;
    try {
      const rows = (await (await fetch(`${apiBase}/api/admin/models`, { credentials: "include" })).json()).rows || [];
      tbody.innerHTML = rows.length ? rows.map((m) => `<tr>
        <td>${escapeHtml(m.label)}</td>
        <td>${escapeHtml(m.upstream_ref)}</td>
        <td><button data-toggle="${escapeHtml(m.id)}" data-enabled="${m.enabled ? 1 : 0}">${m.enabled ? "on" : "off"}</button></td>
      </tr>`).join("") : `<tr class="empty-row"><td colspan="3">No models yet.</td></tr>`;
      tbody.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", async () => {
        await fetch(`${apiBase}/api/admin/models/${b.dataset.toggle}/toggle`, {
          method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: b.dataset.enabled !== "1" }),
        }).catch(() => {});
        loadModels();
      }));
    } catch { tbody.innerHTML = `<tr class="empty-row"><td colspan="3">Failed to load.</td></tr>`; }
  }

  function showLogin() {
    dashboard.hidden = true;
    logoutButton.hidden = true;
    loginSection.hidden = false;
  }

  async function checkAuth() {
    try {
      const res = await fetch(`${apiBase}/api/admin/me`, { credentials: "include" });
      const data = await res.json();
      if (data.authenticated) showDashboard();
      else showLogin();
    } catch {
      showLogin();
    }
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    const submitButton = loginForm.querySelector("button");
    submitButton.disabled = true;
    try {
      await fetch(`${apiBase}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      submitButton.disabled = false;
      loginNotice.hidden = false;
      loginForm.reset();
    }
  });

  logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
      await fetch(`${apiBase}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
    } finally {
      logoutButton.disabled = false;
      showLogin();
    }
  });

  const modelForm = document.querySelector("[data-model-form]");
  modelForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("[data-model-status]");
    try {
      const res = await fetch(`${apiBase}/api/admin/models`, {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: modelForm.elements.label.value.trim(), upstream_ref: modelForm.elements.upstream_ref.value.trim(), enabled: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      status.textContent = "Saved.";
      modelForm.reset();
      loadModels();
    } catch (e) { status.textContent = `Failed: ${e.message}`; }
  });

  const graphStatus = document.querySelector("[data-graph-status]");
  document.querySelector("[data-graph-build]")?.addEventListener("click", async () => {
    graphStatus.textContent = "Building from the catalog… this calls a model and can take a moment.";
    try {
      const res = await fetch(`${apiBase}/api/admin/graph/build`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: "{}" });
      const data = await res.json();
      graphStatus.textContent = res.ok ? `Built: ${data.entities} entities, ${data.relations} relations.` : `Build failed (${data.error || res.status}).`;
    } catch (e) { graphStatus.textContent = `Build failed: ${e.message}`; }
  });
  document.querySelector("[data-graph-export]")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/graph/export`, { credentials: "include" });
      const packet = await res.json();
      const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `stexpedite-graph-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      graphStatus.textContent = "Downloaded.";
    } catch (e) { graphStatus.textContent = `Export failed: ${e.message}`; }
  });
  const graphImportInput = document.querySelector("[data-graph-import-input]");
  document.querySelector("[data-graph-import]")?.addEventListener("click", () => graphImportInput.click());
  graphImportInput?.addEventListener("change", async () => {
    const file = graphImportInput.files[0];
    graphImportInput.value = "";
    if (!file) return;
    try {
      const packet = JSON.parse(await file.text());
      const res = await fetch(`${apiBase}/api/admin/graph/import`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(packet) });
      const data = await res.json();
      graphStatus.textContent = res.ok ? `Imported: ${data.entities} entities, ${data.relations} relations.` : `Import failed (${res.status}).`;
    } catch (e) { graphStatus.textContent = `Import failed: ${e.message}`; }
  });

  checkAuth();
})();
