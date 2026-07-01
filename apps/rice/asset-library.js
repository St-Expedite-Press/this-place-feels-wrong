const assetState = {
  assets: [],
  query: "",
  category: "all",
  place: "all",
  role: "all",
  orientation: "all"
};

const formatBytes = bytes => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const assetMatches = asset => {
  const haystack = [
    asset.id, asset.title, asset.place, asset.category, asset.role, asset.role_label,
    asset.family, asset.status
  ].join(" ").toLowerCase();
  return (!assetState.query || haystack.includes(assetState.query))
    && (assetState.category === "all" || asset.category === assetState.category)
    && (assetState.place === "all" || asset.place_slug === assetState.place)
    && (assetState.role === "all" || asset.role === assetState.role)
    && (assetState.orientation === "all" || asset.orientation === assetState.orientation);
};

function assetCard(asset) {
  return `
    <article class="asset-card">
      <button type="button" class="asset-preview" data-asset-id="${asset.id}" aria-label="Inspect ${asset.title}">
        <img src="${asset.files.web.path}" alt="${asset.alt}" width="${asset.files.web.width}" height="${asset.files.web.height}" style="object-position:${asset.focal_point}" loading="lazy" decoding="async">
        <span>${asset.status}</span>
      </button>
      <div class="asset-card-meta">
        <p>${asset.id}</p>
        <h2>${asset.place.split(",")[0]}</h2>
        <p>${asset.role_label} / ${asset.orientation}</p>
      </div>
    </article>
  `;
}

function renderAssets() {
  const grid = document.querySelector("[data-asset-grid]");
  const count = document.querySelector("[data-asset-count]");
  const matches = assetState.assets.filter(assetMatches);
  grid.innerHTML = matches.length
    ? matches.map(assetCard).join("")
    : `<p class="asset-empty">NO ASSETS MATCH THIS INDEX.</p>`;
  count.textContent = `${String(matches.length).padStart(2, "0")} / ${String(assetState.assets.length).padStart(2, "0")} ASSETS`;
}

function openAsset(asset) {
  const dialog = document.querySelector("[data-asset-dialog]");
  const detail = dialog.querySelector("[data-asset-detail]");
  detail.innerHTML = `
    <figure class="asset-detail-image">
      <img src="${asset.files.web.path}" alt="${asset.alt}" width="${asset.files.web.width}" height="${asset.files.web.height}" style="object-position:${asset.focal_point}">
    </figure>
    <section class="asset-detail-copy">
      <p class="eyebrow">${asset.id} / ${asset.status}</p>
      <h2>${asset.title}</h2>
      <dl>
        <div><dt>Category</dt><dd>${asset.category}</dd></div>
        <div><dt>Place</dt><dd>${asset.place}</dd></div>
        <div><dt>Family</dt><dd>${asset.family}</dd></div>
        <div><dt>Master</dt><dd><a href="${asset.files.master.path}">${asset.files.master.width} × ${asset.files.master.height} / ${formatBytes(asset.files.master.bytes)}</a></dd></div>
        <div><dt>Web</dt><dd><a href="${asset.files.web.path}">${asset.files.web.width} × ${asset.files.web.height} / ${formatBytes(asset.files.web.bytes)}</a></dd></div>
        <div><dt>Focal point</dt><dd>${asset.focal_point}</dd></div>
        <div><dt>Rights</dt><dd>${asset.rights}</dd></div>
        <div><dt>Provenance</dt><dd>${asset.provenance}</dd></div>
        <div><dt>Model</dt><dd>${asset.model}</dd></div>
      </dl>
      <h3>Alt text</h3>
      <p>${asset.alt}</p>
      <h3>Disclosure</h3>
      <p>${asset.disclosure}</p>
      <details><summary>Production prompt</summary><p>${asset.prompt}</p></details>
    </section>
  `;
  dialog.showModal();
}

async function initAssetLibrary() {
  const grid = document.querySelector("[data-asset-grid]");
  if (!grid) return;

  try {
    const response = await fetch("assets/catalog.json");
    if (!response.ok) throw new Error(`Catalog returned ${response.status}`);
    const catalog = await response.json();
    assetState.assets = catalog.assets;

    const categorySelect = document.querySelector("[data-asset-category]");
    const categories = catalog.categories || [];
    const presentCategories = new Set(catalog.assets.map(asset => asset.category));
    categorySelect.insertAdjacentHTML("beforeend", categories
      .filter(category => presentCategories.has(category.id))
      .map(category => `<option value="${category.id}">${category.id}</option>`).join(""));

    const places = [...new Map(catalog.assets.map(asset => [asset.place_slug, asset.place])).entries()];
    const placeSelect = document.querySelector("[data-asset-place]");
    placeSelect.insertAdjacentHTML("beforeend", places.map(([value, label]) => `<option value="${value}">${label}</option>`).join(""));

    const roleSelect = document.querySelector("[data-asset-role]");
    roleSelect.insertAdjacentHTML("beforeend", catalog.roles.map(role => `<option value="${role.id}">${role.label}</option>`).join(""));

    const summary = document.querySelector("[data-asset-summary]");
    const values = summary.querySelectorAll("dd");
    values[0].textContent = catalog.assets.length;
    values[1].textContent = places.length;
    values[2].textContent = catalog.roles.length;

    document.querySelector("[data-asset-search]").addEventListener("input", event => {
      assetState.query = event.target.value.trim().toLowerCase();
      renderAssets();
    });
    categorySelect.addEventListener("change", event => { assetState.category = event.target.value; renderAssets(); });
    placeSelect.addEventListener("change", event => { assetState.place = event.target.value; renderAssets(); });
    roleSelect.addEventListener("change", event => { assetState.role = event.target.value; renderAssets(); });
    document.querySelector("[data-asset-orientation]").addEventListener("change", event => {
      assetState.orientation = event.target.value;
      renderAssets();
    });
    document.querySelector("[data-asset-reset]").addEventListener("click", () => {
      assetState.query = "";
      assetState.category = "all";
      assetState.place = "all";
      assetState.role = "all";
      assetState.orientation = "all";
      document.querySelector("[data-asset-search]").value = "";
      categorySelect.value = "all";
      placeSelect.value = "all";
      roleSelect.value = "all";
      document.querySelector("[data-asset-orientation]").value = "all";
      renderAssets();
    });
    grid.addEventListener("click", event => {
      const trigger = event.target.closest("[data-asset-id]");
      if (!trigger) return;
      openAsset(assetState.assets.find(asset => asset.id === trigger.dataset.assetId));
    });
    renderAssets();
  } catch (error) {
    document.querySelector("[data-asset-count]").hidden = true;
    document.querySelector("[data-asset-error]").hidden = false;
    console.error(error);
  }
}

document.querySelector("[data-asset-close]")?.addEventListener("click", () => {
  document.querySelector("[data-asset-dialog]").close();
});

initAssetLibrary();
