import { requestJson } from "./api-client.js";

const toolbar = document.getElementById("store-toolbar");
const status = document.getElementById("store-status");
const grid = document.getElementById("store-grid");
const footerLink = document.getElementById("store-direct-link");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "View on store";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: String(currency || "USD").toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${String(currency || "USD").toUpperCase()}`;
  }
}

function renderProducts(products, shopUrl) {
  grid.innerHTML = products.map((product) => {
    const href = shopUrl && product.slug ? `${shopUrl.replace(/\/$/, "")}/products/${encodeURIComponent(product.slug)}` : shopUrl;
    return `
      <article class="card product-card">
        <a class="product-link" href="${escapeHtml(href || "#")}" target="_blank" rel="noopener noreferrer">
          <div class="product-image-wrap">
            ${product.image ? `<img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />` : ""}
          </div>
          <div class="product-body">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <div class="product-price">${escapeHtml(formatMoney(product.priceValue, product.priceCurrency))}</div>
          </div>
        </a>
      </article>
    `;
  }).join("");
}

async function loadCatalog(collection = "") {
  if (!status || !grid) return;
  status.textContent = "Loading storefront...";
  const query = collection ? `?collection=${encodeURIComponent(collection)}` : "";
  try {
    const data = await requestJson(`/api/storefront${query}`, { cache: "no-store" });
    const shopUrl = String(data?.shop?.url || "https://shop.stexpedite.press");
    const collections = Array.isArray(data.collections) ? data.collections : [];
    const products = Array.isArray(data.products) ? data.products : [];
    renderProducts(products, shopUrl);
    status.textContent = `Loaded ${products.length} products from the live shop catalog.`;
    if (footerLink) footerLink.href = shopUrl;
    if (toolbar) {
      toolbar.innerHTML = collections.map((item) => `<button class="collection-pill${item.slug === data.collection ? " is-active" : ""}" type="button" data-collection="${escapeHtml(item.slug)}">${escapeHtml(item.name)}</button>`).join("");
      toolbar.querySelectorAll("[data-collection]").forEach((button) => {
        button.addEventListener("click", () => loadCatalog(button.dataset.collection || ""));
      });
    }
  } catch {
    status.textContent = "Inventory unavailable. Browse directly at the shop link below.";
    grid.innerHTML = `<div class="card"><p class="section-copy">Store inventory could not be loaded from the API.</p></div>`;
  }
}

loadCatalog();
